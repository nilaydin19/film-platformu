require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // package.json'daki gerçek kütüphaneyle eşitlendi
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const sequelize = require('./config/db');

// Modellerin İçe Aktarılması
const User = require('./models/User');
const Profile = require('./models/Profile');
const Movie = require('./models/Movie');
const Episode = require('./models/Episode');
const Xray = require('./models/Xray');
const Watchlist = require('./models/Watchlist');
const PlaybackHistory = require('./models/PlaybackHistory');

// Yeni Küratör Listesi Modelleri
const Playlist = require('./models/Playlist');
const PlaylistMovie = require('./models/PlaylistMovie');
const Issue = require('./models/Issue');

const { authMiddleware, requireActiveSubscription, requireAdmin } = require('./middleware/authMiddleware');

const app = express();

// Vercel frontend uygulamanın backend ile pürüzsüz haberleşmesi için CORS ayarı
app.use(cors({
  origin: "https://film-platformu.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// 🔥 FULL COZUM: CANLI SIFRE VE ROL EZICI GIZLI TETIKLEYICI 🔥
app.get('/api/auth/force-seed', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('123456', 10);

    // İlişkili tabloları bozmamak için silme yapmadan doğrudan admin@kinoia.com kullanıcısını buluyoruz
    const adminUser = await User.findOne({ where: { email: 'admin@kinoia.com' } });
    
    if (adminUser) {
      // Şifreyi, rolü ve aboneliği canlıda tepesinden basarak zorla güncelliyoruz
      adminUser.password = hashedPassword; 
      adminUser.role = 'admin';
      adminUser.subscriptionStatus = 'active';
      await adminUser.save();
      res.send("🔥 COZUM BASARILI: CANLI SIFRE BCRYPTJS ILE KESIN OLARAK 123456 YAPILDI VE ADMIN ROLU EZILDI! 🔥");
    } else {
      // Eğer veritabanında bu e-posta yoksa sıfırdan en doğru ayarlarla oluşturuyoruz
      const newAdmin = await User.create({
        email: "admin@kinoia.com",
        password: hashedPassword,
        subscriptionStatus: "active",
        role: "admin"
      });
      const prof = await Profile.create({ 
        userId: newAdmin.id, 
        name: 'Ana Profil', 
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150', 
        isKids: false 
      });
      newAdmin.activeProfileId = prof.id;
      await newAdmin.save();
      res.send("🔥 COZUM BASARILI: ADMIN KULLANICISI SIFIRDAN EN DOĞRU ROLLERLE OLUŞTURULDU! 🔥");
    }
  } catch (err) {
    res.status(500).send("Kilit kırma rotasında teknik hata: " + err.message);
  }
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'kinoia_super_secret_premium_key_2026';

// --- İLİŞKİLERİN TANIMLANMASI ---
User.hasMany(Profile, { foreignKey: 'userId', onDelete: 'CASCADE' });
Profile.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Issue, { foreignKey: 'userId', onDelete: 'CASCADE' });
Issue.belongsTo(User, { foreignKey: 'userId' });

Profile.hasMany(Watchlist, { foreignKey: 'profileId', onDelete: 'CASCADE' });
Watchlist.belongsTo(Profile, { foreignKey: 'profileId' });

Profile.hasMany(PlaybackHistory, { foreignKey: 'profileId', onDelete: 'CASCADE' });
PlaybackHistory.belongsTo(Profile, { foreignKey: 'profileId' });

// Küratör İlişkileri
Profile.hasMany(Playlist, { foreignKey: 'profileId', onDelete: 'CASCADE' });
Playlist.belongsTo(Profile, { foreignKey: 'profileId' });

Playlist.belongsToMany(Movie, { through: PlaylistMovie, foreignKey: 'playlistId', otherKey: 'movieId', onDelete: 'CASCADE' });
Movie.belongsToMany(Playlist, { through: PlaylistMovie, foreignKey: 'movieId', otherKey: 'playlistId', onDelete: 'CASCADE' });

Movie.hasMany(Episode, { foreignKey: 'movieId', onDelete: 'CASCADE' });
Episode.belongsTo(Movie, { foreignKey: 'movieId' });

Movie.hasMany(Xray, { foreignKey: 'movieId', onDelete: 'CASCADE' });
Xray.belongsTo(Movie, { foreignKey: 'movieId' });

Movie.hasMany(Watchlist, { foreignKey: 'movieId', onDelete: 'CASCADE' });
Watchlist.belongsTo(Movie, { foreignKey: 'movieId' });

Movie.hasMany(PlaybackHistory, { foreignKey: 'movieId', onDelete: 'CASCADE' });
PlaybackHistory.belongsTo(Movie, { foreignKey: 'movieId' });

// --- PAYLOAD YARDIMCI METOTLAR ---
const getUserPayload = async (user) => {
  const profiles = await Profile.findAll({ where: { userId: user.id } });
  const profilesWithMetadata = await Promise.all(profiles.map(async (prof) => {
    const watchlistRecords = await Watchlist.findAll({ where: { profileId: prof.id } });
    const watchlistIds = watchlistRecords.map(w => w.movieId);
    const historyRecords = await PlaybackHistory.findAll({ where: { profileId: prof.id } });
    return {
      _id: prof.id,
      id: prof.id,
      name: prof.name,
      avatar: prof.avatar,
      isKids: prof.isKids,
      watchlist: watchlistIds,
      playbackHistory: historyRecords.map(h => ({
        movie: h.movieId,
        progressSeconds: h.progressSeconds,
        durationSeconds: h.durationSeconds,
        lastWatched: h.lastWatched
      }))
    };
  }));
  return {
    id: user.id,
    _id: user.id,
    email: user.email,
    role: user.role,
    subscriptionStatus: user.subscriptionStatus,
    profiles: profilesWithMetadata,
    activeProfileId: user.activeProfileId
  };
};

const getMoviePayload = async (movie) => {
  const xrayRecords = await Xray.findAll({ where: { movieId: movie.id } });
  let seasons = [];
  if (movie.type === 'series') {
    const episodes = await Episode.findAll({ where: { movieId: movie.id } });
    const seasonsMap = {};
    episodes.forEach(ep => {
      if (!seasonsMap[ep.seasonNumber]) { seasonsMap[ep.seasonNumber] = []; }
      seasonsMap[ep.seasonNumber].push({
        _id: ep.id,
        id: ep.id,
        title: ep.title,
        videoUrl: ep.videoUrl,
        youtubeId: ep.youtubeId,
        duration: ep.duration
      });
    });
    seasons = Object.keys(seasonsMap).map(seasonNum => ({
      seasonNumber: Number(seasonNum),
      episodes: seasonsMap[seasonNum]
    }));
  }
  return {
    _id: movie.id,
    id: movie.id,
    title: movie.title,
    description: movie.description,
    thumbnail: movie.thumbnail,
    imdbRating: Number(movie.imdbRating),
    releaseYear: movie.releaseYear,
    genres: movie.genres,
    videoUrl: movie.videoUrl,
    youtubeId: movie.youtubeId,
    type: movie.type,
    origin: movie.origin,
    isTop10: movie.isTop10,
    isWeeklyRecommended: movie.isWeeklyRecommended,
    director: movie.director,
    cast: movie.cast,
    duration: movie.duration,
    curatorReview: movie.curatorReview,
    language: movie.language,
    isKids: movie.isKids,
    ageRating: movie.ageRating,
    xray: xrayRecords.map(x => ({ timeStart: x.timeStart, timeEnd: x.timeEnd, characters: x.characters, song: x.song })),
    seasons: seasons
  };
};

// --- AUTHENTICATION API ROTALARI ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, subscriptionStatus, role } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) { return res.status(400).json({ message: 'E-posta zaten kullanımda.' }); }

    const newUser = await User.create({ email, password, subscriptionStatus: subscriptionStatus || 'inactive', role: role || 'user' });
    const prof1 = await Profile.create({ userId: newUser.id, name: 'Ana Profil', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150', isKids: false });
    await Profile.create({ userId: newUser.id, name: 'Çocuk', avatar: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?q=80&w=150', isKids: true });

    newUser.activeProfileId = prof1.id;
    await newUser.save();

    const payload = await getUserPayload(newUser);
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: payload });
  } catch (error) {
    res.status(500).json({ message: 'Kayıt sırasında sunucu hatası oluştu.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Hatalı bilgiler.' });

    // Modelin içindeki comparePassword fonksiyonu kütüphaneyle tam uyumlu çalışır
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Hatalı bilgiler.' });

    const payload = await getUserPayload(user);
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: payload });
  } catch (error) {
    res.status(500).json({ message: 'Giriş yapılamadı.' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const payload = await getUserPayload(req.user);
  res.json({ user: payload });
});

app.put('/api/auth/update-role', authMiddleware, async (req, res) => {
  try {
    const { role, subscriptionStatus } = req.body;
    if (role) req.user.role = role;
    if (subscriptionStatus) req.user.subscriptionStatus = subscriptionStatus;
    await req.user.save();
    const payload = await getUserPayload(req.user);
    res.json({ user: payload });
  } catch (error) { res.status(500).json({ message: 'Hata.' }); }
});

app.put('/api/auth/profile/switch', authMiddleware, async (req, res) => {
  try {
    const { profileId } = req.body;
    const profile = await Profile.findByPk(profileId);
    if (!profile || profile.userId !== req.user.id) { return res.status(404).json({ message: 'Profil bulunamadı.' }); }
    req.user.activeProfileId = profileId;
    await req.user.save();
    const payload = await getUserPayload(req.user);
    res.json({ message: 'Profil değiştirildi.', user: payload });
  } catch (error) { res.status(500).json({ message: 'Geçiş başarısız.' }); }
});

app.post('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { name, avatar, isKids } = req.body;
    const count = await Profile.count({ where: { userId: req.user.id } });
    if (count >= 4) return res.status(400).json({ message: 'Maksimum 4 profile izin verilmektedir.' });

    await Profile.create({ userId: req.user.id, name, avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150', isKids: !!isKids });
    const payload = await getUserPayload(req.user);
    res.status(201).json({ user: payload });
  } catch (error) { res.status(500).json({ message: 'Hata.' }); }
});

// --- FİLM & DİZİ API ROTALARI ---
app.get('/api/movies', authMiddleware, async (req, res) => {
  try {
    const movies = await Movie.findAll({ order: [['createdAt', 'DESC']] });
    const payloads = await Promise.all(movies.map(m => getMoviePayload(m)));
    res.json(payloads);
  } catch (error) { res.status(500).json({ message: 'Filmler getirilemedi.' }); }
});

app.get('/api/movies/:id', authMiddleware, async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ message: 'İçerik bulunamadı.' });
    const payload = await getMoviePayload(movie);
    res.json(payload);
  } catch (error) { res.status(500).json({ message: 'Hata.' }); }
});

app.get('/api/movies/:id/play', authMiddleware, requireActiveSubscription, async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    res.json({ title: movie.title, videoUrl: movie.videoUrl, youtubeId: movie.youtubeId });
  } catch (error) { res.status(500).json({ message: 'Hata.' }); }
});

// --- İZLEME LİSTEM & İZLEME GEÇMİŞİ ROTALARI ---
app.post('/api/movies/:id/watchlist', authMiddleware, async (req, res) => {
  try {
    const activeProfileId = req.user.activeProfileId;
    const existing = await Watchlist.findOne({ where: { profileId: activeProfileId, movieId: req.params.id } });
    if (existing) {
      await existing.destroy();
      const payload = await getUserPayload(req.user);
      return res.json({ user: payload, isWatchlisted: false });
    } else {
      await Watchlist.create({ profileId: activeProfileId, movieId: req.params.id });
      const payload = await getUserPayload(req.user);
      return res.json({ user: payload, isWatchlisted: true });
    }
  } catch (error) { res.status(500).json({ message: 'İşlem başarısız.' }); }
});

app.post('/api/movies/:id/progress', authMiddleware, async (req, res) => {
  try {
    const { progressSeconds, durationSeconds } = req.body;
    const activeProfileId = req.user.activeProfileId;
    const [record, created] = await PlaybackHistory.findOrCreate({
      where: { profileId: activeProfileId, movieId: req.params.id },
      defaults: { progressSeconds, durationSeconds, lastWatched: new Date() }
    });
    if (!created) {
      record.progressSeconds = progressSeconds;
      record.durationSeconds = durationSeconds;
      record.lastWatched = new Date();
      await record.save();
    }
    res.json({ message: 'İlerleme kaydedildi.' });
  } catch (error) { res.status(500).json({ message: 'Kaydedilemedi.' }); }
});

// --- KÜRATÖR PLAYLIST ROTALARI ("KÜRATÖR SENSİN") ---
app.get('/api/playlists', authMiddleware, async (req, res) => {
  try {
    const profileId = req.user.activeProfileId;
    const playlists = await Playlist.findAll({ where: { profileId }, order: [['createdAt', 'DESC']] });
    const enrichedPlaylists = await Promise.all(playlists.map(async (pl) => {
      const plMovies = await pl.getMovies();
      const moviePayloads = await Promise.all(plMovies.map(m => getMoviePayload(m)));
      return { id: pl.id, _id: pl.id, title: pl.title, description: pl.description, movies: moviePayloads };
    }));
    res.json(enrichedPlaylists);
  } catch (error) { res.status(500).json({ message: 'Listeler çekilemedi.', error: error.message }); }
});

app.get('/api/playlists/all', authMiddleware, async (req, res) => {
  try {
    const playlists = await Playlist.findAll({ order: [['createdAt', 'DESC']], limit: 10 });
    const enrichedPlaylists = await Promise.all(playlists.map(async (pl) => {
      const profile = await Profile.findByPk(pl.profileId);
      const plMovies = await pl.getMovies();
      const moviePayloads = await Promise.all(plMovies.map(m => getMoviePayload(m)));
      return {
        id: pl.id, _id: pl.id, title: pl.title, description: pl.description,
        creatorName: profile ? profile.name : 'Kinoia Küratörü',
        creatorAvatar: profile ? profile.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150',
        movies: moviePayloads
      };
    }));
    res.json(enrichedPlaylists);
  } catch (error) { res.status(500).json({ message: 'Keşfet listeleri alınamadı.' }); }
});

app.post('/api/playlists', authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;
    const profileId = req.user.activeProfileId;
    const newPlaylist = await Playlist.create({ profileId, title, description });
    res.status(201).json({ id: newPlaylist.id, title: newPlaylist.title, description: newPlaylist.description, movies: [] });
  } catch (error) { res.status(400).json({ message: 'Küratör listesi oluşturulamadı.' }); }
});

app.post('/api/playlists/:id/movies', authMiddleware, async (req, res) => {
  try {
    const { movieId } = req.body;
    const playlist = await Playlist.findByPk(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Liste bulunamadı.' });

    const exists = await PlaylistMovie.findOne({ where: { playlistId: playlist.id, movieId } });
    if (!exists) { await PlaylistMovie.create({ playlistId: playlist.id, movieId }); }

    const plMovies = await playlist.getMovies();
    const moviePayloads = await Promise.all(plMovies.map(m => getMoviePayload(m)));
    res.json({ message: 'Film küratör listesine eklendi.', movies: moviePayloads });
  } catch (error) { res.status(500).json({ message: 'Film eklenemedi.' }); }
});

app.delete('/api/playlists/:id/movies/:movieId', authMiddleware, async (req, res) => {
  try {
    const row = await PlaylistMovie.findOne({ where: { playlistId: req.params.id, movieId: req.params.movieId } });
    if (row) { await row.destroy(); }
    res.json({ message: 'Film küratör listesinden kaldırıldı.' });
  } catch (error) { res.status(500).json({ message: 'Kaldırılamadı.' }); }
});

// --- SORUN BİLDİRME VE ŞİKAYETLER ROTALARI ---
app.post('/api/issues', authMiddleware, async (req, res) => {
  try {
    const { movieId, movieTitle, description } = req.body;
    const activeProfile = await Profile.findByPk(req.user.activeProfileId);
    const newIssue = await Issue.create({
      userId: req.user.id, userEmail: req.user.email, profileId: req.user.activeProfileId,
      profileName: activeProfile ? activeProfile.name : 'Bilinmeyen Profil',
      movieId: movieId || null, movieTitle: movieTitle || null, description, status: 'pending'
    });
    res.status(201).json(newIssue);
  } catch (error) { res.status(500).json({ message: 'Şikayet iletilemedi.', error: error.message }); }
});

app.get('/api/issues', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const issues = await Issue.findAll({ order: [['createdAt', 'DESC']] });
    res.json(issues);
  } catch (error) { res.status(500).json({ message: 'Sorunlar listesi alınamadı.' }); }
});

app.put('/api/issues/:id/status', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Sorun bulunamadı.' });
    issue.status = issue.status === 'pending' ? 'resolved' : 'pending';
    await issue.save();
    res.json(issue);
  } catch (error) { res.status(500).json({ message: 'Güncellenemedi.' }); }
});

app.delete('/api/issues/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Sorun bulunamadı.' });
    await issue.destroy();
    res.json({ message: 'Şikayet silindi.' });
  } catch (error) { res.status(500).json({ message: 'Silinemedi.' }); }
});

// --- ADMIN PANELI CRUD VE STATS ---
app.get('/api/admin/stats', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const totalMovies = await Movie.count();
    const totalUsers = await User.count();
    const activeSubs = await User.count({ where: { subscriptionStatus: 'active' } });
    res.json({ totalMovies, totalUsers, activeSubs });
  } catch (error) { res.status(500).json({ message: 'Hata.' }); }
});

app.post('/api/movies', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    if (req.body.seasons && req.body.seasons.length > 0) {
      for (const s of req.body.seasons) {
        for (const ep of s.episodes) {
          await Episode.create({
            movieId: movie.id, seasonNumber: s.seasonNumber, title: ep.title,
            videoUrl: ep.videoUrl, youtubeId: ep.youtubeId, duration: ep.duration
          });
        }
      }
    }
    const payload = await getMoviePayload(movie);
    res.status(201).json(payload);
  } catch (error) { res.status(400).json({ message: 'Hata.', error: error.message }); }
});

app.put('/api/movies/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Hata.' });

    await movie.update(req.body);
    if (movie.type === 'series' && req.body.seasons) {
      await Episode.destroy({ where: { movieId: movie.id } });
      for (const s of req.body.seasons) {
        for (const ep of s.episodes) {
          await Episode.create({
            movieId: movie.id, seasonNumber: s.seasonNumber, title: ep.title,
            videoUrl: ep.videoUrl, youtubeId: ep.youtubeId, duration: ep.duration
          });
        }
      }
    }
    const payload = await getMoviePayload(movie);
    res.json(payload);
  } catch (error) { res.status(400).json({ message: 'Hata.' }); }
});

app.delete('/api/movies/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Hata.' });
    await movie.destroy();
    res.json({ message: 'Silindi.' });
  } catch (error) { res.status(500).json({ message: 'Silinemedi.' }); }
});

// --- VERİTABANI BAŞLANGIÇ TOHUMLAMA (SEED) ---
async function seedDatabase() {
  try {
    const userCount = await User.count();
    if (userCount === 0) {
      // Hatalı kısıtlamalara takılmadan veritabanı boşken ilk kurulumu güvenli yapar
      const hashedPassword = await bcrypt.hash('123456', 10);
      const admin = await User.create({ email: "admin@kinoia.com", password: hashedPassword, subscriptionStatus: "active", role: "admin" });
      const prof1 = await Profile.create({ userId: admin.id, name: 'Ana Profil', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150', isKids: false });
      await Profile.create({ userId: admin.id, name: 'Çocuk', avatar: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?q=80&w=150', isKids: true });
      admin.activeProfileId = prof1.id;
      await admin.save();

      const standard = await User.create({ email: "user@kinoia.com", password: hashedPassword, subscriptionStatus: "active", role: "user" });
      const prof2 = await Profile.create({ userId: standard.id, name: 'Sinema Odası', avatar: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=150', isKids: false });
      standard.activeProfileId = prof2.id;
      await standard.save();
    }

    const movieCount = await Movie.count();
    if (movieCount <= 14) { 
      await Episode.destroy({ where: {} });
      await Xray.destroy({ where: {} });
      await PlaylistMovie.destroy({ where: {} });
      await Movie.destroy({ where: {} });

      const d1 = await Movie.create({
        title: "Dune: Part Two", description: "Paul Atreides, Chani ve Fremenlerle güçlerini birleştiriyor...",
        thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000",
        imdbRating: 8.6, releaseYear: 2024, genres: ["Bilim Kurgu", "Macera", "Dram"], youtubeId: "U2Qp5pL3CQQ", origin: "hollywood", type: "movie", isTop10: true, isWeeklyRecommended: true, director: "Denis Villeneuve", cast: ["Timothée Chalamet", "Zendaya"], duration: "2s 46dk", language: "İngilizce", isKids: false, ageRating: "13+"
      });
      console.log('Başlangıç seed verileri MySQL\'e yüklendi!');
    }
  } catch (error) { console.error('Seed hatası:', error); }
}

async function startServer() {
  try {
    const host = process.env.DB_HOST || '127.0.0.1';
    const port = process.env.DB_PORT || 3306;
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'kinoia';

    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();

    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('MySQL / Sequelize Veritabanı Senkronizasyonu Başarılı!');
    
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Kinoia MySQL API sunucusu ${PORT} portunda yayında.`);
    });
  } catch (error) { console.error('Sunucu başlatılamadı:', error); }
}

startServer();