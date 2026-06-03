const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PlaybackHistory = sequelize.define('PlaybackHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  profileId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  progressSeconds: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  durationSeconds: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastWatched: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = PlaybackHistory;
