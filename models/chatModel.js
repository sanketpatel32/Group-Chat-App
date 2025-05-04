const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./userModel'); // Import the related model
const Group = require('./groupModel'); // Import the group model

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
    fileUrl: { // Add the fileUrl field
        type: Sequelize.STRING,
        allowNull: true, // Allow null for text-only messages
    },
    userId: { // Foreign key
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: User, 
            key: 'id' 
        },
        onDelete: 'CASCADE' 
    },
    groupId: { // Foreign key
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: Group, // Reference the Group model
            key: 'id'    // Reference the primary key in the Group model
        },
        onDelete: 'CASCADE' 
    }
});

// Define relationships
User.hasMany(Chat); // A user can have many chats
Chat.belongsTo(User); // Each chat belongs to a user

Group.hasMany(Chat); // A group can have many chats
Chat.belongsTo(Group); // Each chat belongs to a group (optional)

module.exports = Chat;