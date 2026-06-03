require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
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
app.use(cors({
  origin: "https://film-platformu.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

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
      if (!seasonsMap[ep.seasonNumber]) {
        seasonsMap[ep.seasonNumber] = [];
      }
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
    xray: xrayRecords.map(x => ({
      timeStart: x.timeStart,
      timeEnd: x.timeEnd,
      characters: x.characters,
      song: x.song
    })),
    seasons: seasons
  };
};

// --- AUTHENTICATION API ROTALARI ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, subscriptionStatus, role } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'E-posta zaten kullanımda.' });
    }

    const newUser = await User.create({
      email,
      password,
      subscriptionStatus: subscriptionStatus || 'inactive',
      role: role || 'user'
    });

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
  } catch (error) {
    res.status(500).json({ message: 'Hata.' });
  }
});

app.put('/api/auth/profile/switch', authMiddleware, async (req, res) => {
  try {
    const { profileId } = req.body;
    const profile = await Profile.findByPk(profileId);
    if (!profile || profile.userId !== req.user.id) {
      return res.status(404).json({ message: 'Profil bulunamadı.' });
    }
    
    req.user.activeProfileId = profileId;
    await req.user.save();
    
    const payload = await getUserPayload(req.user);
    res.json({ message: 'Profil değiştirildi.', user: payload });
  } catch (error) {
    res.status(500).json({ message: 'Geçiş başarısız.' });
  }
});

app.post('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { name, avatar, isKids } = req.body;
    const count = await Profile.count({ where: { userId: req.user.id } });
    if (count >= 4) return res.status(400).json({ message: 'Maksimum 4 profile izin verilmektedir.' });

    await Profile.create({
      userId: req.user.id,
      name,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150',
      isKids: !!isKids
    });
    
    const payload = await getUserPayload(req.user);
    res.status(201).json({ user: payload });
  } catch (error) {
    res.status(500).json({ message: 'Hata.' });
  }
});

// --- FİLM & DİZİ API ROTALARI ---

app.get('/api/movies', authMiddleware, async (req, res) => {
  try {
    const movies = await Movie.findAll({ order: [['createdAt', 'DESC']] });
    const payloads = await Promise.all(movies.map(m => getMoviePayload(m)));
    res.json(payloads);
  } catch (error) {
    res.status(500).json({ message: 'Filmler getirilemedi.' });
  }
});

app.get('/api/movies/:id', authMiddleware, async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ message: 'İçerik bulunamadı.' });
    const payload = await getMoviePayload(movie);
    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: 'Hata.' });
  }
});

app.get('/api/movies/:id/play', authMiddleware, requireActiveSubscription, async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    res.json({ title: movie.title, videoUrl: movie.videoUrl, youtubeId: movie.youtubeId });
  } catch (error) {
    res.status(500).json({ message: 'Hata.' });
  }
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
  } catch (error) {
    res.status(500).json({ message: 'İşlem başarısız.' });
  }
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
  } catch (error) {
    res.status(500).json({ message: 'Kaydedilemedi.' });
  }
});

// --- KÜRATÖR PLAYLIST ROTALARI ("KÜRATÖR SENSİN") ---

app.get('/api/playlists', authMiddleware, async (req, res) => {
  try {
    const profileId = req.user.activeProfileId;
    const playlists = await Playlist.findAll({
      where: { profileId },
      order: [['createdAt', 'DESC']]
    });

    const enrichedPlaylists = await Promise.all(playlists.map(async (pl) => {
      const plMovies = await pl.getMovies();
      const moviePayloads = await Promise.all(plMovies.map(m => getMoviePayload(m)));
      return {
        id: pl.id,
        _id: pl.id,
        title: pl.title,
        description: pl.description,
        movies: moviePayloads
      };
    }));

    res.json(enrichedPlaylists);
  } catch (error) {
    res.status(500).json({ message: 'Listeler çekilemedi.', error: error.message });
  }
});

app.get('/api/playlists/all', authMiddleware, async (req, res) => {
  try {
    const playlists = await Playlist.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    const enrichedPlaylists = await Promise.all(playlists.map(async (pl) => {
      const profile = await Profile.findByPk(pl.profileId);
      const plMovies = await pl.getMovies();
      const moviePayloads = await Promise.all(plMovies.map(m => getMoviePayload(m)));
      
      return {
        id: pl.id,
        _id: pl.id,
        title: pl.title,
        description: pl.description,
        creatorName: profile ? profile.name : 'Kinoia Küratörü',
        creatorAvatar: profile ? profile.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150',
        movies: moviePayloads
      };
    }));

    res.json(enrichedPlaylists);
  } catch (error) {
    res.status(500).json({ message: 'Keşfet listeleri alınamadı.' });
  }
});

app.post('/api/playlists', authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;
    const profileId = req.user.activeProfileId;

    const newPlaylist = await Playlist.create({
      profileId,
      title,
      description
    });

    res.status(201).json({ id: newPlaylist.id, title: newPlaylist.title, description: newPlaylist.description, movies: [] });
  } catch (error) {
    res.status(400).json({ message: 'Küratör listesi oluşturulamadı.' });
  }
});

app.post('/api/playlists/:id/movies', authMiddleware, async (req, res) => {
  try {
    const { movieId } = req.body;
    const playlist = await Playlist.findByPk(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Liste bulunamadı.' });

    const exists = await PlaylistMovie.findOne({ where: { playlistId: playlist.id, movieId } });
    if (!exists) {
      await PlaylistMovie.create({ playlistId: playlist.id, movieId });
    }

    const plMovies = await playlist.getMovies();
    const moviePayloads = await Promise.all(plMovies.map(m => getMoviePayload(m)));

    res.json({ message: 'Film küratör listesine eklendi.', movies: moviePayloads });
  } catch (error) {
    res.status(500).json({ message: 'Film eklenemedi.' });
  }
});

app.delete('/api/playlists/:id/movies/:movieId', authMiddleware, async (req, res) => {
  try {
    const row = await PlaylistMovie.findOne({ where: { playlistId: req.params.id, movieId: req.params.movieId } });
    if (row) {
      await row.destroy();
    }
    res.json({ message: 'Film küratör listesinden kaldırıldı.' });
  } catch (error) {
    res.status(500).json({ message: 'Kaldırılamadı.' });
  }
});

// --- SORUN BİLDİRME VE ŞİKAYETLER ROTALARI ---

app.post('/api/issues', authMiddleware, async (req, res) => {
  try {
    const { movieId, movieTitle, description } = req.body;
    const activeProfile = await Profile.findByPk(req.user.activeProfileId);
    
    const newIssue = await Issue.create({
      userId: req.user.id,
      userEmail: req.user.email,
      profileId: req.user.activeProfileId,
      profileName: activeProfile ? activeProfile.name : 'Bilinmeyen Profil',
      movieId: movieId || null,
      movieTitle: movieTitle || null,
      description,
      status: 'pending'
    });
    
    res.status(201).json(newIssue);
  } catch (error) {
    res.status(500).json({ message: 'Şikayet iletilemedi.', error: error.message });
  }
});

app.get('/api/issues', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const issues = await Issue.findAll({ order: [['createdAt', 'DESC']] });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Sorunlar listesi alınamadı.' });
  }
});

app.put('/api/issues/:id/status', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Sorun bulunamadı.' });
    
    issue.status = issue.status === 'pending' ? 'resolved' : 'pending';
    await issue.save();
    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: 'Güncellenemedi.' });
  }
});

app.delete('/api/issues/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Sorun bulunamadı.' });
    
    await issue.destroy();
    res.json({ message: 'Şikayet silindi.' });
  } catch (error) {
    res.status(500).json({ message: 'Silinemedi.' });
  }
});

// --- ADMIN PANELI CRUD VE STATS ---

app.get('/api/admin/stats', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const totalMovies = await Movie.count();
    const totalUsers = await User.count();
    const activeSubs = await User.count({ where: { subscriptionStatus: 'active' } });
    res.json({ totalMovies, totalUsers, activeSubs });
  } catch (error) {
    res.status(500).json({ message: 'Hata.' });
  }
});

app.post('/api/movies', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    if (req.body.seasons && req.body.seasons.length > 0) {
      for (const s of req.body.seasons) {
        for (const ep of s.episodes) {
          await Episode.create({
            movieId: movie.id,
            seasonNumber: s.seasonNumber,
            title: ep.title,
            videoUrl: ep.videoUrl,
            youtubeId: ep.youtubeId,
            duration: ep.duration
          });
        }
      }
    }
    const payload = await getMoviePayload(movie);
    res.status(201).json(payload);
  } catch (error) {
    res.status(400).json({ message: 'Hata.', error: error.message });
  }
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
            movieId: movie.id,
            seasonNumber: s.seasonNumber,
            title: ep.title,
            videoUrl: ep.videoUrl,
            youtubeId: ep.youtubeId,
            duration: ep.duration
          });
        }
      }
    }
    const payload = await getMoviePayload(movie);
    res.json(payload);
  } catch (error) {
    res.status(400).json({ message: 'Hata.' });
  }
});

app.delete('/api/movies/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Hata.' });
    await movie.destroy();
    res.json({ message: 'Silindi.' });
  } catch (error) {
    res.status(500).json({ message: 'Silinemedi.' });
  }
});

// --- VERİTABANI BAŞLANGIÇ TOHUMLAMA (SEED) ---

async function seedDatabase() {
  try {
    const userCount = await User.count();
    // ŞİFRE KİLİDİNİ KIRAN KESİN SEED KODU
    console.log("🔥 Eski kullanıcılar temizleniyor ve şifre güncelleniyor...");
    await User.destroy({ where: { email: ['admin@kinoia.com', 'user@kinoia.com'] } });

    const admin = await User.create({
      email: "admin@kinoia.com",
      password: "$2b$10$wNzgbe4fdfLInV8mOnDPh.WpXpZ6Psz7W1M3yFmQzP1/bK.pWfWw2", // '123456' şifresinin güvenli hash hali
      subscriptionStatus: "active",
      role: "admin"
    });
    const prof1 = await Profile.create({ userId: admin.id, name: 'Ana Profil', avatar: 'http://images.unsplash.com...' });
    await Profile.create({ userId: admin.id, name: 'Çocuk', avatar: 'https://images.unsplash.com...' });
    admin.activeProfileId = prof1.id;
    await admin.save();

    const standard = await User.create({
      email: "user@kinoia.com",
      password: "$2b$10$wNzgbe4fdfLInV8mOnDPh.WpXpZ6Psz7W1M3yFmQzP1/bK.pWfWw2", // '123456'
      subscriptionStatus: "active",
      role: "user"
    });
    const prof2 = await Profile.create({ userId: standard.id, name: 'Sinema Odası', avatar: 'https://images.unsplash.com...' });
    standard.activeProfileId = prof2.id;
    await standard.save();

    console.log('🔥 Canlı bulutta şifreler başarıyla 123456 yapıldı! 🔥');

    const movieCount = await Movie.count();
    if (movieCount <= 14) { // 12 standard + 3 kids titles = 15 titles threshold
      await Episode.destroy({ where: {} });
      await Xray.destroy({ where: {} });
      await PlaylistMovie.destroy({ where: {} });
      await Movie.destroy({ where: {} });

      // 1. DUNE: PART TWO (2024)
      const d1 = await Movie.create({
        title: "Dune: Part Two",
        description: "Paul Atreides, Chani ve Fremenlerle güçlerini birleştirerek ailesini yok eden komploculardan intikam almak için savaş açıyor. Hayatının aşkı ile bilinen evrenin kaderi arasında bir seçim yapmak zorunda kalırken, yalnızca kendisinin öngörebileceği korkunç bir geleceği engellemeye çalışıyor.",
        thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000",
        imdbRating: 8.6,
        releaseYear: 2024,
        genres: ["Bilim Kurgu", "Macera", "Dram"],
        youtubeId: "U2Qp5pL3CQQ",
        origin: "hollywood",
        type: "movie",
        isTop10: true,
        isWeeklyRecommended: true,
        director: "Denis Villeneuve",
        cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
        duration: "2s 46dk",
        curatorReview: "Denis Villeneuve, Frank Herbert'ün başyapıtını sinematik bir destana dönüştürüyor. Görsel ve işitsel bir şölen.",
        language: "İngilizce",
        isKids: false,
        ageRating: "13+"
      });
      await Xray.create({ movieId: d1.id, timeStart: 0, timeEnd: 30, characters: ["Timothée Chalamet", "Zendaya"], song: "Fremen Desert Theme" });

      // 2. OPPENHEIMER (2023)
      const d2 = await Movie.create({
        title: "Oppenheimer",
        description: "Fizikçi J. Robert Oppenheimer'ın önderliğindeki bilim ekibinin Manhattan Projesi kapsamında ilk nükleer silahı geliştirmesini ve ardından gelen siyasi fırtınaları konu edinen başyapıt.",
        thumbnail: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1000",
        imdbRating: 8.9,
        releaseYear: 2023,
        genres: ["Dram", "Tarih", "Biyografi"],
        youtubeId: "uYPbbksJxIg",
        origin: "hollywood",
        type: "movie",
        isTop10: true,
        isWeeklyRecommended: true,
        director: "Christopher Nolan",
        cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."],
        duration: "3s 00dk",
        curatorReview: "Cillian Murphy'nin olağanüstü performansı ve Nolan'ın zaman döngülerini ustalıkla kullanışı, sinema tarihine altın harflerle geçiyor.",
        language: "İngilizce",
        isKids: false,
        ageRating: "16+"
      });

      // 3. SPIDER-MAN: ACROSS THE SPIDER-VERSE (2023)
      const d3 = await Movie.create({
        title: "Spider-Man: Across the Spider-Verse",
        description: "Miles Morales, çoklu evrenleri korumakla görevli Örümcek Topluluğu ile yolları kesiştiğinde, kahramanlığın gerçek anlamını sorguladığı yepyeni bir kozmik serüvene atılıyor.",
        thumbnail: "https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=1000",
        imdbRating: 8.6,
        releaseYear: 2023,
        genres: ["Animasyon", "Aksiyon", "Bilim Kurgu"],
        youtubeId: "cqGjhVJWtEg",
        origin: "hollywood",
        type: "movie",
        isTop10: false,
        isWeeklyRecommended: true,
        director: "Joaquim Dos Santos",
        cast: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac"],
        duration: "2s 20dk",
        curatorReview: "Animasyon sanatının sınırlarını zorlayan, her karesi bir tablo niteliğinde olan görsel bir devrim.",
        language: "İngilizce",
        isKids: true,
        ageRating: "Genel İzleyici"
      });

      // 4. PROJECT HAIL MARY (2026)
      const d4 = await Movie.create({
        title: "Project Hail Mary",
        description: "Dünya'yı yok olmaktan kurtarmak için tek başına uzayda uyanan ve kayıp anılarını toplayarak kozmik bir tehditle mücadele eden astronot Ryland Grace'in hikayesi.",
        thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000",
        imdbRating: 8.8,
        releaseYear: 2026,
        genres: ["Bilim Kurgu", "Dram", "Macera"],
        youtubeId: "Way9DexNy3w",
        origin: "hollywood",
        type: "movie",
        isTop10: true,
        isWeeklyRecommended: false,
        director: "Phil Lord",
        cast: ["Ryan Gosling", "Sandra Hüller"],
        duration: "2s 10dk",
        curatorReview: "Andy Weir'ın popüler romanından uyarlanan, Ryan Gosling'in harika oyunculuğuyla süslenmiş 2026'nın en iyi bilim kurgu filmi.",
        language: "İngilizce",
        isKids: false,
        ageRating: "13+"
      });

      // 5. SUPERMAN (2025)
      const d5 = await Movie.create({
        title: "Superman",
        description: "Kriptonlu mirası ile dünyalı yetiştirilme tarzını uzlaştırmaya çalışan Superman'in, James Gunn vizyonuyla sinema evreninde yepyeni başlangıcını konu alan destansı film.",
        thumbnail: "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?q=80&w=1000",
        imdbRating: 8.5,
        releaseYear: 2025,
        genres: ["Aksiyon", "Macera", "Bilim Kurgu"],
        youtubeId: "N73oO0-W6ik",
        origin: "hollywood",
        type: "movie",
        isTop10: true,
        isWeeklyRecommended: false,
        director: "James Gunn",
        cast: ["David Corenswet", "Rachel Brosnahan", "Nicholas Hoult"],
        duration: "2s 25dk",
        curatorReview: "Umut ve ışık dolu klasik Superman ruhunu modern sinemaya mükemmel şekilde taşıyan taze bir nefes.",
        language: "İngilizce",
        isKids: false,
        ageRating: "13+"
      });

      // 6. HOUSE OF THE DRAGON (Dizi, 2022-)
      const d6 = await Movie.create({
        title: "House of the Dragon",
        description: "Game of Thrones olaylarından 200 yıl önce Targaryen Hanesi'nin kendi içindeki taht kavgalarını ve ejderhaların dansını anlatan ödüllü epik dizi.",
        thumbnail: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000",
        imdbRating: 8.4,
        releaseYear: 2022,
        genres: ["Aksiyon", "Macera", "Dram", "Fantastik"],
        origin: "hollywood",
        type: "series",
        isTop10: true,
        isWeeklyRecommended: true,
        director: "Miguel Sapochnik",
        cast: ["Paddy Considine", "Matt Smith", "Emma D'Arcy"],
        curatorReview: "Targaryen hanedanının politik entrikalarını ve ejderhaların görsel ihtişamını muazzam bir dramla işleyen şaheser.",
        language: "İngilizce",
        isKids: false,
        ageRating: "18+"
      });
      await Episode.create({ movieId: d6.id, seasonNumber: 1, title: "Bölüm 1: The Heirs of the Dragon", youtubeId: "DotnJ7tTA34", duration: "60dk" });
      await Episode.create({ movieId: d6.id, seasonNumber: 1, title: "Bölüm 2: The Rogue Prince", youtubeId: "X03L_QWl1iA", duration: "55dk" });

      // 7. THE LAST OF US (Dizi, 2023-)
      const d7 = await Movie.create({
        title: "The Last of Us",
        description: "Medeniyeti yok eden bir salgının ardından, hayatta kalan Joel'un insanlığın son umudu olan 14 yaşındaki Ellie'yi karantina bölgesinden kaçırma görevini konu alan sürükleyici macera.",
        thumbnail: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=1000",
        imdbRating: 8.8,
        releaseYear: 2023,
        genres: ["Aksiyon", "Macera", "Dram", "Gerilim"],
        origin: "hollywood",
        type: "series",
        isTop10: true,
        isWeeklyRecommended: true,
        director: "Craig Mazin",
        cast: ["Pedro Pascal", "Bella Ramsey"],
        curatorReview: "Oyun adaptasyonlarının zirvesi. Joel ve Ellie'nin duygusal bağı kalbinize dokunacak.",
        language: "İngilizce",
        isKids: false,
        ageRating: "18+"
      });
      await Episode.create({ movieId: d7.id, seasonNumber: 1, title: "Bölüm 1: When You're Lost in the Darkness", youtubeId: "uLtkt8BonwM", duration: "80dk" });
      await Episode.create({ movieId: d7.id, seasonNumber: 1, title: "Bölüm 2: Infected", youtubeId: "0vU3z0yLp-o", duration: "55dk" });

      // 8. SAHSIYET (Yerli Dizi, 2018-)
      const d8 = await Movie.create({
        title: "Şahsiyet",
        description: "Alzheimer teşhisi konan emekli bir adliye memuru olan Agâh Beyoğlu'nun, geçmişteki bir suçun faillerini cezalandırmak için çıktığı cinayet serüveni ve polis teşkilatındaki maceraları.",
        thumbnail: "https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=1000",
        imdbRating: 9.0,
        releaseYear: 2018,
        genres: ["Suç", "Gizem", "Dram", "Gerilim"],
        origin: "turkish",
        type: "series",
        isTop10: true,
        isWeeklyRecommended: true,
        director: "Onur Saylak",
        cast: ["Haluk Bilginer", "Cansu Dere", "Şebnem Bozoklu"],
        curatorReview: "Haluk Bilginer'e Emmy Ödülü kazandıran, benzersiz oyunculukları ve noir Türk atmosferiyle yerli dizi tarihinin zirvesi.",
        language: "Türkçe",
        isKids: false,
        ageRating: "18+"
      });
      await Episode.create({ movieId: d8.id, seasonNumber: 1, title: "Bölüm 1: Ben Agâh Beyoğlu", youtubeId: "03q9jVepbSw", duration: "65dk" });
      await Episode.create({ movieId: d8.id, seasonNumber: 1, title: "Bölüm 2: Kırmızı Kurdele", youtubeId: "hXbNphY8qws", duration: "60dk" });

      // 9. GIBI (Yerli Dizi, 2021-)
      const d9 = await Movie.create({
        title: "Gibi",
        description: "Yılmaz, İlkkan ve Ersoy'un her gün karşılaştıkları son derece sıradan olayları absürt tartışmalarla devasa çıkmazlara dönüştürmesini konu edinen benzersiz komedi.",
        thumbnail: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1000",
        imdbRating: 9.0,
        releaseYear: 2021,
        genres: ["Komedi"],
        origin: "turkish",
        type: "series",
        isTop10: false,
        isWeeklyRecommended: true,
        director: "Ömer Sinir",
        cast: ["Feyyaz Yiğit", "Kıvanç Kılınç", "Ahmet Kürşat Öçalan"],
        curatorReview: "Türk komedisinde absürt mizahın miladı. Yılmaz ve İlkkan'ın replikleri şimdiden birer klasik.",
        language: "Türkçe",
        isKids: false,
        ageRating: "16+"
      });
      await Episode.create({ movieId: d9.id, seasonNumber: 1, title: "Bölüm 1: Kokariç", youtubeId: "Lg2_Omsq0Uo", duration: "35dk" });
      await Episode.create({ movieId: d9.id, seasonNumber: 1, title: "Bölüm 2: Vatka", youtubeId: "kFwJ1KjA1uQ", duration: "40dk" });

      // 10. ANATOMY OF A FALL (2023 - Fransızca Film)
      const d10 = await Movie.create({
        title: "Anatomy of a Fall",
        description: "Fransız Alpleri'nde ücra bir dağ kulübesinde yaşayan bir adamın şüpheli ölümü sonrası, görme engelli oğullarının tek şahit olduğu davada, adamın eşi Sandra'nın cinayetle suçlanmasını konu alan Oscar ödüllü başyapıt.",
        thumbnail: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?q=80&w=1000",
        imdbRating: 7.7,
        releaseYear: 2023,
        genres: ["Dram", "Suç", "Gizem"],
        youtubeId: "fTrSp5hkj7I",
        origin: "other",
        type: "movie",
        isTop10: false,
        isWeeklyRecommended: true,
        director: "Justine Triet",
        cast: ["Sandra Hüller", "Swann Arlaud"],
        duration: "2s 31dk",
        curatorReview: "Kusursuz mahkeme sahneleri ve insan psikolojisinin derinliklerine inen, son yılların en iyi Avrupa sineması örneklerinden.",
        language: "Fransızca",
        isKids: false,
        ageRating: "16+"
      });

      // 11. T-34 (2019 - Rusça Film)
      const d11 = await Movie.create({
        title: "T-34",
        description: "İkinci Dünya Savaşı sırasında esir düşen cesur bir Rus tank komutanının, efsanevi bir T-34 tankını kullanarak Alman esaret kampından kaçış için planladığı destansı kurtuluş operasyonu.",
        thumbnail: "https://images.unsplash.com/photo-1498036882173-b41c28a8ba34?q=80&w=1000",
        imdbRating: 6.8,
        releaseYear: 2019,
        genres: ["Aksiyon", "Savaş", "Dram"],
        youtubeId: "w2Xn20rZfks",
        origin: "other",
        type: "movie",
        isTop10: false,
        isWeeklyRecommended: false,
        director: "Aleksey Sidorov",
        cast: ["Alexander Petrov", "Viktor Dobronravov"],
        duration: "2s 19dk",
        language: "Rusça",
        isKids: false,
        ageRating: "16+"
      });

      // 12. DAS LEBEN DER ANDEREN (2006 - Almanca Film)
      const d12 = await Movie.create({
        title: "Das Leben der Anderen",
        description: "Doğu Berlin'deki Stasi gizli polis teşkilatı ajanı Gerd Wiesler'in, bir oyun yazarını ve sevgilisini gizlice gözetlemekle görevlendirilmesi sonrası, onların hayatından etkilenerek kendi inançlarını sorgulamasını anlatan En İyi Yabancı Film Oscar'lı kült yapıt.",
        thumbnail: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000",
        imdbRating: 8.4,
        releaseYear: 2006,
        genres: ["Dram", "Gizem", "Gerilim"],
        youtubeId: "FppW5ml4vdw",
        origin: "other",
        type: "movie",
        isTop10: true,
        isWeeklyRecommended: true,
        director: "Florian Henckel von Donnersmarck",
        cast: ["Ulrich Mühe", "Sebastian Koch", "Martina Gedeck"],
        duration: "2s 17dk",
        curatorReview: "Gözetleme altındaki bir toplumda sanatın, vicdanın ve özgürlüğün gücünü olağanüstü bir gerilim ve duyguyla anlatan bir şaheser.",
        language: "Almanca",
        isKids: false,
        ageRating: "16+"
      });

      // 13. KARLAR ÜLKESİ 2 (Frozen II) (2019 - Çocuk İçeriği)
      const d13 = await Movie.create({
        title: "Karlar Ülkesi 2 (Frozen II)",
        description: "Elsa, kız kardeşi Anna, Kristoff, Olaf ve Sven ile birlikte krallıkları Arendelle'in sınırlarını aşarak kadim bir ormanın gizemlerini çözmek ve Elsa'nın sihirli güçlerinin kaynağını bulmak için tehlikeli bir yolculuğa çıkıyor.",
        thumbnail: "https://images.unsplash.com/photo-1608889174637-3c44f6326f1a?q=80&w=1000",
        imdbRating: 7.2,
        releaseYear: 2019,
        genres: ["Animasyon", "Macera", "Aile"],
        youtubeId: "Zi4LMpSD3Nk",
        origin: "other",
        type: "movie",
        isTop10: false,
        isWeeklyRecommended: true,
        director: "Chris Buck",
        cast: ["Kristen Bell", "Idina Menzel", "Josh Gad"],
        duration: "1s 43dk",
        curatorReview: "Mükemmel görsel efektleri, akılda kalıcı şarkıları ve güçlü kardeşlik bağı temasıyla Frozen efsanesinin harika bir devamı.",
        language: "Türkçe",
        isKids: true,
        ageRating: "Genel İzleyici"
      });

      // 14. KUNG FU PANDA 4 (2024 - Çocuk İçeriği)
      const d14 = await Movie.create({
        title: "Kung Fu Panda 4",
        description: "Ejderha Savaşçısı Po, Barış Vadisi'nin Ruhani Lideri olmaya çağrılırken, Bukalemun adındaki tehlikeli bir büyücünün Po'nun geçmişteki düşmanlarının dövüş yeteneklerini çalmasını engellemek için tilki Zhen ile güçlerini birleştiriyor.",
        thumbnail: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=1000",
        imdbRating: 6.3,
        releaseYear: 2024,
        genres: ["Animasyon", "Komedi", "Aksiyon"],
        youtubeId: "lHcEPW0_I_k",
        origin: "hollywood",
        type: "movie",
        isTop10: true,
        isWeeklyRecommended: false,
        director: "Mike Mitchell",
        cast: ["Jack Black", "Awkwafina", "Viola Davis"],
        duration: "1s 34dk",
        curatorReview: "Jack Black'in Po rolündeki harika enerjisi, yepyeni maceraları ve komik dövüş sahneleriyle çocuklar için harika bir animasyon şöleni.",
        language: "İngilizce",
        isKids: true,
        ageRating: "Genel İzleyici"
      });

      // 15. RAFADAN TAYFA (Dizi, 2014- - Çocuk İçeriği)
      const d15 = await Movie.create({
        title: "Rafadan Tayfa",
        description: "İstanbul'un eski bir mahallesinde yaşayan sevimli ve meraklı bir çocuk grubunun dostlukları, eğlenceli sokak maceraları ve sıcacık mahalle kültürünü konu alan milli animasyon serimiz.",
        thumbnail: "https://images.unsplash.com/photo-1560942485-b2a11cc13456?q=80&w=1000",
        imdbRating: 7.8,
        releaseYear: 2014,
        genres: ["Animasyon", "Komedi", "Macera"],
        origin: "turkish",
        type: "series",
        isTop10: false,
        isWeeklyRecommended: true,
        director: "İsmail Fidan",
        cast: ["Şirin Giobbi", "Levent Kol", "Yağmur Serin"],
        curatorReview: "Kültürümüzü çocuklara eğlenceli ve öğretici bir dille aktaran, nostaljik mahalle oyunlarını yaşatan harika bir yerli yapım.",
        language: "Türkçe",
        isKids: true,
        ageRating: "Genel İzleyici"
      });
      await Episode.create({ movieId: d15.id, seasonNumber: 1, title: "Bölüm 1: Gizemli Kutu", youtubeId: "DkHsk3uC39w", duration: "12dk" });
      await Episode.create({ movieId: d15.id, seasonNumber: 1, title: "Bölüm 2: Efsanevi Sokak Maçı", youtubeId: "DkHsk3uC39w", duration: "14dk" });

      // Default Seed Playlist oluşturma ("Kinoia Küratör Odası")
      const pl = await Playlist.create({
        profileId: 1, // Ana Profil
        title: "Küratör Seçkisi: Sinematik Başyapıtlar",
        description: "IMDb puanı en yüksek, sinemada çığır açmış modern klasiklerin derlemesi."
      });
      await PlaylistMovie.create({ playlistId: pl.id, movieId: d1.id });
      await PlaylistMovie.create({ playlistId: pl.id, movieId: d2.id });
      await PlaylistMovie.create({ playlistId: pl.id, movieId: d8.id });

      console.log('Başlangıç seed film, dizi ve playlist verileri MySQL\'e yüklendi!');
    }
  } catch (error) {
    console.error('Seed hatası:', error);
  }
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
  } catch (error) {
    console.error('Sunucu başlatılamadı:', error);
  }
}

startServer();
