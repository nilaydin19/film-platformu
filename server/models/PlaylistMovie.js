const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PlaylistMovie = sequelize.define('PlaylistMovie', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  playlistId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = PlaylistMovie;
