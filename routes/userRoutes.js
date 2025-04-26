// routes/auth.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/signup', userController.handleUserSignup);

module.exports = router;
