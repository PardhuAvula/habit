const asyncHandler = require('express-async-handler');
const prisma = require('../config/db');

// @desc    Get all goals for current user
// @route   GET /api/goals
// @access  Private
exports.getGoals = asyncHandler(async (req, res) => {
  const goals = await prisma.goal.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  
  res.status(200).json(goals);
});

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
exports.createGoal = asyncHandler(async (req, res) => {
  const { title, targetValue, deadline } = req.body;

  if (!title || !targetValue) {
    res.status(400);
    throw new Error('Please provide title and target value');
  }

  const goal = await prisma.goal.create({
    data: {
      userId: req.user.id,
      title,
      targetValue: parseFloat(targetValue),
      currentValue: 0,
      deadline: deadline ? new Date(deadline) : null,
    },
  });

  res.status(201).json(goal);
});

// @desc    Update goal progress
// @route   PUT /api/goals/:id/progress
// @access  Private
exports.updateGoalProgress = asyncHandler(async (req, res) => {
  const goalId = parseInt(req.params.id);
  const { currentValue } = req.body;

  // Verify ownership
  const existingGoal = await prisma.goal.findUnique({
    where: { id: goalId }
  });

  if (!existingGoal) {
    res.status(404);
    throw new Error('Goal not found');
  }

  if (existingGoal.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this goal');
  }

  const updatedGoal = await prisma.goal.update({
    where: { id: goalId },
    data: {
      currentValue: parseFloat(currentValue),
    },
  });

  res.status(200).json(updatedGoal);
});

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = asyncHandler(async (req, res) => {
  const goalId = parseInt(req.params.id);

  // Verify ownership
  const existingGoal = await prisma.goal.findUnique({
    where: { id: goalId }
  });

  if (!existingGoal) {
    res.status(404);
    throw new Error('Goal not found');
  }

  if (existingGoal.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this goal');
  }

  await prisma.goal.delete({
    where: { id: goalId },
  });

  res.status(200).json({ message: 'Goal deleted successfully' });
});
