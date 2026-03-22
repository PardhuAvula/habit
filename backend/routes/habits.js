const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habit.controller');
const logController = require('../controllers/log.controller');
const authMiddleware = require('../middleware/auth');

// Protected routes
router.use(authMiddleware);

// Habits CRUD
router.get('/', habitController.getHabits);
router.post('/', habitController.createHabit);
router.put('/:id', habitController.updateHabit);
router.delete('/:id', habitController.deleteHabit);

// Log routes
router.post('/:id/log', habitController.logHabit);


module.exports = router;
