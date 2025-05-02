const groupModel = require("../models/groupModel");
const userModel = require("../models/userModel"); // Import the user model
const groupUserModel = require("../models/groupUserModel"); // Import the group user model
const { Op } = require("sequelize"); // Import Op for Sequelize operators

const createGroup = async (req, res) => {
    const { name } = req.body;
    const userId = req.user.userId; // Get the user ID from the token
    try {
        const group = await groupModel.create({ name });
        await groupUserModel.create({ userId, groupId: group.id, isAdmin: true }); // Add the user as an admin to the group
        res.status(201).json({ status: "Group created", group });
    }
    catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const getGroups = async (req, res) => {
    const userId = req.user.userId; // Get the user ID from the token
    try {
        const groups = await groupModel.findAll({
            include: [
                {
                    model: groupUserModel,
                    where: { userId },
                    attributes: [], // Exclude userId from the result
                },
            ],
        });
        res.status(200).json({ status: "Success", groups });
    }
    catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const addUserToGroup = async (req, res) => {
    const { groupId, email } = req.body; // Get groupId and email from the request body

    try {
        // Find the user by email
        const user = await userModel.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the user is already in the group
        const existingMembership = await groupUserModel.findOne({
            where: { groupId, userId: user.id },
        });

        if (existingMembership) {
            return res.status(400).json({ error: "User is already in the group" });
        }

        // Add the user to the group
        await groupUserModel.create({ groupId, userId: user.id });

        res.status(200).json({ status: "User added to group successfully" });
    } catch (error) {
        console.error("Error adding user to group:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getGroupUsers = async (req, res) => {
    const { groupId } = req.params; // Get groupId from the request parameters

    try {
        // Fetch users in the group along with their role (isAdmin)
        const users = await groupUserModel.findAll({
            where: { groupId },
            attributes: ['userId', 'isAdmin'], // Fetch userId and isAdmin from groupUserModel
        });

        // Fetch user details for each userId
        const userDetails = await Promise.all(
            users.map(async (groupUser) => {
                const user = await userModel.findOne({
                    where: { id: groupUser.userId },
                    attributes: ['id', 'name', 'email'], // Fetch user details
                });
                return {
                    ...user.dataValues,
                    isAdmin: groupUser.isAdmin, // Add isAdmin to the response
                };
            })
        );

        res.status(200).json({ status: "Success", users: userDetails });
    } catch (error) {
        console.error("Error fetching group users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const removeUserFromGroup = async (req, res) => {
    const { groupId, userId } = req.body; // Get groupId and userId from the request body
    const currentUserId = req.user.userId; // Get the current user's ID from the token

    try {
        // Check if the current user is an admin of the group
        const currentUserMembership = await groupUserModel.findOne({
            where: { groupId, userId: currentUserId, isAdmin: true },
        });

        if (!currentUserMembership) {
            return res.status(403).json({ error: "Only admins can remove users from the group." });
        }

        // Check if the user is in the group
        const userMembership = await groupUserModel.findOne({
            where: { groupId, userId },
        });

        if (!userMembership) {
            return res.status(404).json({ error: "User not found in the group." });
        }

        // Remove the user from the group
        await userMembership.destroy();

        res.status(200).json({ status: "User removed from group successfully." });
    } catch (error) {
        console.error("Error removing user from group:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const makeAdmin = async (req, res) => {
    const { groupId, userId } = req.body; // Get groupId and userId from the request body
    const currentUserId = req.user.userId; // Get the current user's ID from the token

    try {
        // Check if the current user is an admin of the group
        const currentUserMembership = await groupUserModel.findOne({
            where: { groupId, userId: currentUserId, isAdmin: true },
        });

        if (!currentUserMembership) {
            return res.status(403).json({ error: "Only admins can promote users to admin." });
        }

        // Update the user's role to admin
        const userMembership = await groupUserModel.findOne({
            where: { groupId, userId },
        });

        if (!userMembership) {
            return res.status(404).json({ error: "User not found in the group." });
        }

        userMembership.isAdmin = true;
        await userMembership.save();

        res.status(200).json({ status: "User promoted to admin successfully." });
    } catch (error) {
        console.error("Error promoting user to admin:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const isAdmin = async (req, res) => {
    const { groupId } = req.params; // Get groupId from the request parameters
    const userId = req.user.userId; // Get the user ID from the token

    try {
        // Check if the user is an admin of the group
        const membership = await groupUserModel.findOne({
            where: { groupId, userId },
        });

        if (!membership) {
            return res.status(404).json({ isAdmin: false });
        }

        res.status(200).json({ isAdmin: membership.isAdmin });
    } catch (error) {
        console.error("Error checking admin status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


module.exports = { createGroup, getGroups, addUserToGroup,getGroupUsers,removeUserFromGroup,makeAdmin,isAdmin};