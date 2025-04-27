const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const dashboardRoutes = require('./dashboardRoutes');
// Import individual route files

router.use('/user', userRoutes);
router.use('/dashboard', dashboardRoutes); // Assuming this is the correct path for dashboard routes
// Combine them into one router

module.exports = router;
