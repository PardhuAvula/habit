const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goal.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', goalController.getGoals);
router.post('/', goalController.createGoal);
router.put('/:id/progress', goalController.updateGoalProgress);
router.delete('/:id', goalController.deleteGoal);

module.exports = router;
