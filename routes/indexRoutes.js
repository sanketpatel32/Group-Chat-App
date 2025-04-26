const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
// Import individual route files

router.use('/user', userRoutes);
// Combine them into one router

module.exports = router;
