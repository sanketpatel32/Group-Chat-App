const Sequelize = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./userModel');
const GroupUser = require('./groupUserModel'); // Import the join table model

const Group = sequelize.define('group', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

// Define the many-to-many relationship using the explicit join table
Group.belongsToMany(User, { through: GroupUser });
User.belongsToMany(Group, { through: GroupUser });

// Associate Group with GroupUser
Group.hasMany(GroupUser, { foreignKey: 'groupId' });
GroupUser.belongsTo(Group, { foreignKey: 'groupId' });

module.exports = Group;