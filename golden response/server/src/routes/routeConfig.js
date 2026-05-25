// routeConfig.js — central router, all base paths live here
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const taskRoutes = require('./task.routes');
const userRoutes = require('./user.routes');

router.use('/auth', authRoutes);   // /api/v2/auth/*
router.use('/tasks', taskRoutes);  // /api/v2/tasks/*
router.use('/user', userRoutes);   // /api/v2/user/*

module.exports = router;
