// routes/auth.js
const express = require('express');
const path = require('path');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); 
const chatController = require('../controllers/chatController'); 

router.post('/send', authMiddleware, chatController.receiveChat); 
router.get('/getAll',  chatController.getChat);
router.get('/getNew', authMiddleware, chatController.getNewChats);


module.exports = router;
