const groupModel = require("../models/groupModel");
const groupUserModel = require("../models/groupUserModel"); // Import the group user model


const createGroup = async (req, res) => {
    const { name } = req.body;
    const userId = req.user.userId; // Get the user ID from the token
    try {
        const group = await groupModel.create({ name });
        await groupUserModel.create({ userId, groupId: group.id });
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
const userModel = require("../models/userModel"); // Import the user model

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


module.exports = { createGroup, getGroups, addUserToGroup };