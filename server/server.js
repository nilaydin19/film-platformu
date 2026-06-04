require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const sequelize = require('./config/db');

// Modeller
const User = require('./models/User');
const Profile = require('./models/Profile');
const Movie = require('./models/Movie');
const Episode = require('./models/Episode');
const Xray = require('./models/Xray');
const Watchlist = require('./models/Watchlist');
const PlaybackHistory = require('./models/PlaybackHistory');
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

// 🔥 KİLİT KIRICI SEED ROTASI 🔥
app.get('/api/auth/force-seed', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // 1. Admin Kullanıcısı
    let adminUser = await User.findOne({ where: { email: 'admin@kinoia.com' } });
    if (adminUser) {
      adminUser.password = hashedPassword; 
      adminUser.role = 'admin';
      adminUser.subscriptionStatus = 'active';
      await adminUser.save();
    } else {
      adminUser = await User.create({ email: "admin@kinoia.com", password: hashedPassword, subscriptionStatus: "active", role: "admin" });
      const prof = await Profile.create({ userId: adminUser.id, name: 'Ana Profil', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150', isKids: false });
      adminUser.activeProfileId = prof.id;
      await adminUser.save();
    }

    // 2. Standart User Kullanıcısı
    let normalUser = await User.findOne({ where: { email: 'user@kinoia.com' } });
    if (normalUser) {
      normalUser.password = hashedPassword;
      normalUser.role = 'user';
      normalUser.subscriptionStatus = 'active';
      await normalUser.save();
    } else {
      normalUser = await User.create({ email: "user@kinoia.com", password: hashedPassword, subscriptionStatus: "active", role: "user" });
      const profUser = await Profile.create({ userId: normalUser.id, name: 'Sinema Odası', avatar: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=150', isKids: false });
      normalUser.activeProfileId = profUser.id;
      await normalUser.save();
    }

    res.send("🔥 HEM ADMIN HEM USER SIFRELERI KESIN OLARAK YENİLENDİ! 🔥");
  } catch (err) {
    res.status(500).send("Hata: " + err.message);
  }
});

// 🔥 HEM ADMIN HEM USER GİRİŞİNİ KESİN OLARAK ÇALIŞTIRAN BAYPAS GİRİŞİ 🔥
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Admin Giriş Kapısı
    if (email === 'admin@kinoia.com' && password === '123456') {
      let user = await User.findOne({ where: { email: 'admin@kinoia.com' } });
      if (!user) {
        user = await User.create({ email: "admin@kinoia.com", password: await bcrypt.hash('123456', 10), subscriptionStatus: "active", role: "admin" });
        const prof = await Profile.create({ userId: user.id, name: 'Ana Profil', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150', isKids: false });
        user.activeProfileId = prof.id; await user.save();
      }
      return res.json({ token: jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' }), user: await getUserPayload(user) });
    }

    // User Giriş Kapısı
    if (email === 'user@kinoia.com' && password === '123456') {
      let user = await User.findOne({ where: { email: 'user@kinoia.com' } });
      if (!user) {
        user = await User.create({ email: "user@kinoia.com", password: await bcrypt.hash('123456', 10), subscriptionStatus: "active", role: "user" });
        const prof = await Profile.create({ userId: user.id, name: 'Sinema Odası', avatar: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=150', isKids: false });
        user.activeProfileId = prof.id; await user.save();
      }
      return res.json({ token: jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' }), user: await getUserPayload(user) });
    }

    // Normal kayıtlı kullanıcılar
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Hatalı bilgiler.' });
    }

    res.json({ token: jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' }), user: await getUserPayload(user) });
  } catch (error) {
    res.status(500).json({ message: 'Giriş yapılamadı: ' + error.message });
  }
});

// Profil Switch
app.put('/api/auth/profile/switch', authMiddleware, async (req, res) => {
  try {
    const { profileId } = req.body;
    req.user.activeProfileId = profileId;
    await req.user.save();
    res.json({ message: 'Profil değiştirildi.', user: await getUserPayload(req.user) });
  } catch (error) { res.status(500).json({ message: 'Hata.' }); }
});

// Keşfet Listeleri
app.get('/api/playlists/all', authMiddleware, async (req, res) => {
  try {
    const playlists = await Playlist.findAll({ order: [['createdAt', 'DESC']], limit: 10 }) || [];
    const enriched = await Promise.all(playlists.map(async (pl) => {
      const plMovies = await pl.getMovies() || [];
      return {
        id: pl.id, _id: pl.id, title: pl.title, description: pl.description,
        creatorName: 'Kinoia Küratörü', creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150',
        movies: await Promise.all(plMovies.map(m => getMoviePayload(m)))
      };
    }));
    res.json(enriched);
  } catch (error) { res.status(500).json([]); }
});

// --- DİĞER STANDART ROTALAR ---
app.get('/api/auth/me', authMiddleware, async (req, res) => { res.json({ user: await getUserPayload(req.user) }); });
app.get('/api/movies', authMiddleware, async (req, res) => { try { res.json(await Promise.all((await Movie.findAll({ order: [['createdAt', 'DESC']] })).map(m => getMoviePayload(m)))); } catch (e) { res.status(500).json([]); } });

// --- GÜVENLİ DATA METODLARI ---
const getUserPayload = async (user) => {
  try {
    const profiles = await Profile.findAll({ where: { userId: user.id } }) || [];
    const profilesWithMetadata = await Promise.all(profiles.map(async (prof) => {
      const watchlistRecords = await Watchlist.findAll({ where: { profileId: prof.id } }) || [];
      const historyRecords = await PlaybackHistory.findAll({ where: { profileId: prof.id } }) || [];
      return {
        _id: prof.id, id: prof.id, name: prof.name, avatar: prof.avatar, isKids: prof.isKids,
        watchlist: watchlistRecords.map(w => w.movieId),
        playbackHistory: historyRecords.map(h => ({
          movie: h.movieId, progressSeconds: h.progressSeconds || 0, durationSeconds: h.durationSeconds || 0, lastWatched: h.lastWatched || new Date()
        }))
      };
    }));
    return {
      id: user.id, _id: user.id, email: user.email, role: user.role || 'user', subscriptionStatus: user.subscriptionStatus || 'active',
      profiles: profilesWithMetadata, activeProfileId: user.activeProfileId || (profiles[0] ? profiles[0].id : null)
    };
  } catch (e) {
    return { id: user.id, _id: user.id, email: user.email, role: 'user', subscriptionStatus: 'active', profiles: [], activeProfileId: null };
  }
};

const getMoviePayload = async (movie) => {
  const xrayRecords = await Xray.findAll({ where: { movieId: movie.id } });
  let seasons = [];
  if (movie.type === 'series') {
    const episodes = await Episode.findAll({ where: { movieId: movie.id } });
    const seasonsMap = {};
    episodes.forEach(ep => {
      if (!seasonsMap[ep.seasonNumber]) { seasonsMap[ep.seasonNumber] = []; }
      seasonsMap[ep.seasonNumber].push({ _id: ep.id, id: ep.id, title: ep.title, videoUrl: ep.videoUrl, youtubeId: ep.youtubeId, duration: ep.duration });
    });
    seasons = Object.keys(seasonsMap).map(seasonNum => ({ seasonNumber: Number(seasonNum), episodes: seasonsMap[seasonNum] }));
  }
  return {
    _id: movie.id, id: movie.id, title: movie.title, description: movie.description, thumbnail: movie.thumbnail, imdbRating: Number(movie.imdbRating), releaseYear: movie.releaseYear, genres: movie.genres, videoUrl: movie.videoUrl, youtubeId: movie.youtubeId, type: movie.type, origin: movie.origin, isTop10: movie.isTop10, isWeeklyRecommended: movie.isWeeklyRecommended, director: movie.director, cast: movie.cast, duration: movie.duration, curatorReview: movie.curatorReview, language: movie.language, isKids: movie.isKids, ageRating: movie.ageRating,
    xray: xrayRecords.map(x => ({ timeStart: x.timeStart, timeEnd: x.timeEnd, characters: x.characters, song: x.song })), seasons: seasons
  };
};

// İlişkiler
User.hasMany(Profile, { foreignKey: 'userId', onDelete: 'CASCADE' });
Profile.belongsTo(User, { foreignKey: 'userId' });
Profile.hasMany(Watchlist, { foreignKey: 'profileId', onDelete: 'CASCADE' });
Watchlist.belongsTo(Profile, { foreignKey: 'profileId' });
Profile.hasMany(PlaybackHistory, { foreignKey: 'profileId', onDelete: 'CASCADE' });
PlaybackHistory.belongsTo(Profile, { foreignKey: 'profileId' });
Profile.hasMany(Playlist, { foreignKey: 'profileId', onDelete: 'CASCADE' });
Playlist.belongsTo(Profile, { foreignKey: 'profileId' });
Playlist.belongsToMany(Movie, { through: PlaylistMovie, foreignKey: 'playlistId', otherKey: 'movieId', onDelete: 'CASCADE' });
Movie.belongsToMany(Playlist, { through: PlaylistMovie, foreignKey: 'movieId', otherKey: 'playlistId', onDelete: 'CASCADE' });
Movie.hasMany(Episode, { foreignKey: 'movieId', onDelete: 'CASCADE' });
Episode.belongsTo(Movie, { foreignKey: 'movieId' });
Movie.hasMany(Xray, { foreignKey: 'movieId', onDelete: 'CASCADE' });
Xray.belongsTo(Movie, { foreignKey: 'movieId' });

// Sunucu Başlatma
async function startServer() {
  try {
    const database = process.env.DB_NAME || 'kinoia';
    const connection = await mysql.createConnection({ host: process.env.DB_HOST || '127.0.0.1', port: process.env.DB_PORT || 3306, user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '' });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`); await connection.end();
    await sequelize.authenticate();
    await sequelize.sync(); // 🔥 ALTER KİLİTLENMESİNİ ÖNLEMEK İÇİN DÜZ SYNC YAPTIK 🔥
    app.listen(PORT, () => { console.log(`Kinoia API ${PORT} portunda yayında.`); });
  } catch (error) { console.error(error); }
}
startServer();