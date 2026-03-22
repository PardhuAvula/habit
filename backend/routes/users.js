const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/change-password', authMiddleware, userController.changePassword);
router.put('/profile-photo', authMiddleware, upload.single('image'), userController.updateProfilePhoto);
router.get('/stats', authMiddleware, userController.getUserStats);


module.exports = router;
