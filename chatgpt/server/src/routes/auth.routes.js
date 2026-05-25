// src/routes/auth.routes.js
const express = require('express');
const authController = require('../controllers/authController');
const { validateBody } = require('../middlewares/validation.middleware');
const { registerSchema, loginSchema, googleLoginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.post('/google-login', validateBody(googleLoginSchema), authController.googleLogin);
router.post('/forgot-password', validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), authController.resetPassword);

module.exports = router;
