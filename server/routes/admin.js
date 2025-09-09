// server/routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// @route   POST api/admin/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login', adminController.login);

// @route   POST api/admin/forgot-password
// @desc    Admin forgot password
// @access  Public
router.post('/forgot-password', adminController.forgotPassword);

// @route   POST api/admin/reset-password/:token
// @desc    Admin reset password
// @access  Public
router.post('/reset-password/:token', adminController.resetPassword);

module.exports = router;