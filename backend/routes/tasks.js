const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.patch('/:id/toggle', taskController.toggleTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
