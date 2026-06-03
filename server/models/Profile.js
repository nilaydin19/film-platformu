const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150'
  },
  isKids: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Profile;
