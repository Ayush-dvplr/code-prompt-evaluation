// src/routes/user.routes.js
const express = require('express');
const userController = require('../controllers/userController');
const protect = require('../middlewares/auth.middleware');

const router = express.Router();

// All user routes require authentication
router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.patch('/password', userController.changePassword);

module.exports = router;
