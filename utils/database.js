const Sequelize = require('sequelize');
require('dotenv').config();

const DB_NAME = 'groupChat';
const DB_USER = 'root';
const DB_PASSWORD = 'root';
const DB_HOST = 'localhost';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  dialect: 'mysql',
  host: DB_HOST,
  port: 3306,
});

module.exports = sequelize;