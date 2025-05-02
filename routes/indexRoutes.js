const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const chatRoutes = require('./chatRoutes'); 
const groupRoutes = require('./groupRoutes'); // Assuming this is the correct path for group routes 
router.use('/user', userRoutes);
router.use('/dashboard', dashboardRoutes); // Assuming this is the correct path for dashboard routes
router.use('/chat', chatRoutes); // Assuming this is the correct path for chat routes
router.use('/groups', groupRoutes); // Assuming this is the correct path for group routes
// Combine them into one router

module.exports = router;
