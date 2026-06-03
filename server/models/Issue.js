const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Issue = sequelize.define('Issue', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  profileId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  profileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  movieTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'resolved'),
    defaultValue: 'pending'
  }
});

module.exports = Issue;
