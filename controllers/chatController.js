const userModel = require("../models/userModel");
const chatModel = require("../models/chatModel");
const { Op } = require("sequelize");

const receiveChat = async (req, res) => {
    const userId = req.user.userId; 
    const { message } = req.body;

    chatModel
        .create({
            message: message,
            userId: userId, // Use the userId from the decoded token
        })
        .then((chat) => {
            res.status(200).json({ status: "Message received", chat });
        })
        .catch((error) => {
            console.error("Error saving chat:", error);
            res.status(500).json({ error: "Internal server error" });
        });
}

const getChat = async (req, res) => {
    try {
        const chats = await chatModel.findAll({
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

const getNewChats = async (req, res) => {
    const lastMessageId = parseInt(req.query.lastMessageId) || 0;

    try {
        const chats = await chatModel.findAll({
            where: {
                id: { [Op.gt]: lastMessageId }, // Only chats with ID > lastMessageId
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