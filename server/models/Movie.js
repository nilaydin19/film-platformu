const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Movie = sequelize.define('Movie', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imdbRating: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: false
  },
  releaseYear: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  genres: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const value = this.getDataValue('genres');
      return value ? value.split(',').map(g => g.trim()) : [];
    },
    set(value) {
      this.setDataValue('genres', Array.isArray(value) ? value.join(',') : value);
    }
  },
  
  // Film Oynatma Linkleri
  videoUrl: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  youtubeId: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  
  // Tip Ayrımı (Film vs Dizi)
  type: {
    type: DataTypes.ENUM('movie', 'series'),
    defaultValue: 'movie'
  },
  
  origin: {
    type: DataTypes.ENUM('hollywood', 'turkish', 'other'),
    defaultValue: 'other'
  },
  isTop10: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isWeeklyRecommended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  director: {
    type: DataTypes.STRING,
    defaultValue: 'Bilinmiyor'
  },
  cast: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('cast');
      return value ? value.split(',').map(c => c.trim()) : [];
    },
    set(value) {
      this.setDataValue('cast', Array.isArray(value) ? value.join(',') : value);
    }
  },
  duration: {
    type: DataTypes.STRING,
    defaultValue: '2s 15dk'
  },
  curatorReview: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'English'
  },
  isKids: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ageRating: {
    type: DataTypes.STRING,
    defaultValue: 'Genel İzleyici'
  }
});

module.exports = Movie;
