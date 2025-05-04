const userModel = require("../models/userModel");
const chatModel = require("../models/chatModel");
const groupModel = require("../models/groupModel"); // Import the group model
const { Op } = require("sequelize");

// Function to receive and save a chat message
const receiveChat = async (req, res) => {
    const userId = req.user.userId; 
    const { message, groupId } = req.body; // Include groupId in the request body

    try {
        // Save the chat to the database
        const chat = await chatModel.create({
            message: message,
            userId: userId, // Use the userId from the decoded token
            groupId: groupId, // Save the groupId
        });

        // Fetch the user's name from the userModel
        const user = await userModel.findOne({
            where: { id: userId },
            attributes: ['id', 'name'], // Fetch only the id and name
        });

        // Include the user's name in the response
        res.status(200).json({
            status: "Message received",
            chat: {
                id: chat.id,
                message: chat.message,
                groupId: chat.groupId,
                user: {
                    id: user.id,
                    name: user.name,
                },
                createdAt: chat.createdAt,
            },
        });
    } catch (error) {
        console.error("Error saving chat:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
// Function to fetch all chats for a specific group
const getChat = async (req, res) => {
    const { groupId } = req.query; // Get groupId from query parameters

    try {
        const chats = await chatModel.findAll({
            where: { groupId }, // Filter chats by groupId
            include: [
                {
                    model: userModel, // Include the user model to fetch user details
                    attributes: ['id', 'name'], // Specify the fields you want from the user model
                },
            ],
            order: [['createdAt', 'ASC']], // Optional: Order chats by creation time
        });

        res.status(200).json({ status: "Success", chats });
    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Function to fetch new chats for a specific group
const getNewChats = async (req, res) => {
    const lastMessageId = parseInt(req.query.lastMessageId) || 0;
    const { groupId } = req.query; // Get groupId from query parameters

    try {
        const chats = await chatModel.findAll({
            where: {
                id: { [Op.gt]: lastMessageId }, // Only chats with ID > lastMessageId
                groupId, // Filter by groupId
            },
            include: [
                {
                    model: userModel,
                    attributes: ['id', 'name'],
                },
            ],
            order: [['createdAt', 'ASC']],
        });

        const currentUserId = req.user.userId;
        res.status(200).json({ status: "Success", chats, currentUserId });
    } catch (error) {
        console.error("Error fetching new chats:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    receiveChat,
    getChat,
    getNewChats,
};