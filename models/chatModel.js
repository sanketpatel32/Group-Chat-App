const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./userModel'); // Import the related model

const Chat = sequelize.define('chat', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    message: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    userId: { // Foreign key
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: User, // Reference the User model
            key: 'id'    // Reference the primary key in the User model
        },
        onDelete: 'CASCADE' 
    }
});

User.hasMany(Chat); // A user can have many chats
Chat.belongsTo(User); // Each chat belongs to a user

module.exports = Chat;