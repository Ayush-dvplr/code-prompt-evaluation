// user.routes.js — profile routes, all protected
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const protect = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const { updateProfileSchema, changePasswordSchema } = require('../validators/user.validator');

router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', validateBody(updateProfileSchema), userController.updateProfile);
router.patch('/password', validateBody(changePasswordSchema), userController.changePassword);

module.exports = router;
