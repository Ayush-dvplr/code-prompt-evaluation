// routeConfig.js — central router; all base paths live here, mounted at /api/v1
const express = require('express')
const router = express.Router()

const authRoutes = require('./auth.routes')
const taskRoutes = require('./task.routes')
const userRoutes = require('./user.routes')

router.use('/auth', authRoutes)   // /api/v1/auth/*
router.use('/tasks', taskRoutes)  // /api/v1/tasks/*
router.use('/user', userRoutes)   // /api/v1/user/*

module.exports = router
