// routes/auth.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); 
const groupController = require('../controllers/groupController');

router.post('/create', authMiddleware, groupController.createGroup); // Create a new group
router.get('/getGroups', authMiddleware, groupController.getGroups); // Get all groups for the user
router.post('/addUser', authMiddleware, groupController.addUserToGroup); // Add a user to a group



module.exports = router;
