const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./userModel');
const Group = require('./groupModel');

const GroupUser = sequelize.define('groupUser', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    groupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Group,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
});

module.exports = GroupUser;