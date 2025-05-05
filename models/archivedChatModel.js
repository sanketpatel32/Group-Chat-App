const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const ArchivedChat = sequelize.define('archivedChat', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    message: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    fileUrl: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    groupId: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
    },
});

module.exports = ArchivedChat;