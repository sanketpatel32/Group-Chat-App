const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); 
const groupController = require('../controllers/groupController');

router.post('/create', authMiddleware, groupController.createGroup); // Create a new group
router.get('/getGroups', authMiddleware, groupController.getGroups); // Get all groups for the user
router.post('/addUser', authMiddleware, groupController.addUserToGroup); // Add a user to a group
router.get('/getGroupUsers/:groupId', authMiddleware, groupController.getGroupUsers); // Get all users in a group
router.post('/makeAdmin', authMiddleware, groupController.makeAdmin); // Make a user an admin
router.post('/removeUser', authMiddleware, groupController.removeUserFromGroup); // Remove a user from a group
router.get('/isAdmin/:groupId', authMiddleware, groupController.isAdmin); // Check if the user is an admin of the group
// router.get('/searchUsers', authMiddleware, groupController.searchUsers); // Search for users

module.exports = router;