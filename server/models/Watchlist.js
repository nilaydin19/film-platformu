const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Watchlist = sequelize.define('Watchlist', {
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
  }
});

module.exports = Watchlist;
