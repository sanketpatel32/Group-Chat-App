// routes/auth.js
const express = require('express');
const path = require('path');
const router = express.Router();
const userController = require('../controllers/userController');
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'dashboard.html'));
});

module.exports = router;
