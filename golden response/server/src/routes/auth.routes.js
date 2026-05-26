// auth.routes.js
const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { validateBody } = require('../middlewares/validationMiddleware')
const {
  registerSchema,
  loginSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshSchema,
} = require('../validators/auth.validator')

router.post('/register', validateBody(registerSchema), authController.register)
router.post('/login', validateBody(loginSchema), authController.login)
router.post('/google', validateBody(googleAuthSchema), authController.googleAuth)
router.post('/refresh', validateBody(refreshSchema), authController.refresh)
router.post('/logout', authController.logout)
router.post('/forgot-password', validateBody(forgotPasswordSchema), authController.forgotPassword)
router.post('/reset-password', validateBody(resetPasswordSchema), authController.resetPassword)

module.exports = router
