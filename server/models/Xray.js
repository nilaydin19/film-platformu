const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Xray = sequelize.define('Xray', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  movieId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  timeStart: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  timeEnd: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  characters: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const value = this.getDataValue('characters');
      return value ? value.split(',').map(c => c.trim()) : [];
    },
    set(value) {
      this.setDataValue('characters', Array.isArray(value) ? value.join(',') : value);
    }
  },
  song: {
    type: DataTypes.STRING,
    defaultValue: 'Kinoia Orijinal Müziği'
  }
});

module.exports = Xray;
