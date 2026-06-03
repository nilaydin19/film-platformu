const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Episode = sequelize.define('Episode', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  seasonNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  videoUrl: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  youtubeId: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  duration: {
    type: DataTypes.STRING,
    defaultValue: '45dk'
  }
});

module.exports = Episode;
