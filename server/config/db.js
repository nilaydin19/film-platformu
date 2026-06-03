const { Sequelize } = require('sequelize');

const host = process.env.DB_HOST || '127.0.0.1';
const port = process.env.DB_PORT || 3306;
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'kinoia';

const sequelize = new Sequelize(database, user, password, {
  host: host,
  port: port,
  dialect: 'mysql',
  logging: false, // Konsolda SQL sorgu kalabalığını gizlemek için false yapıyoruz
  define: {
    timestamps: true
  }
});

module.exports = sequelize;
