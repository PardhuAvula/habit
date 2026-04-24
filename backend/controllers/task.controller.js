const asyncHandler = require('express-async-handler');
const prisma = require('../config/db');
const { addXP } = require('./user.controller');

// @desc    Get all tasks for current user for a specific date
// @route   GET /api/tasks?date=YYYY-MM-DD
// @access  Private
exports.getTasks = asyncHandler(async (req, res) => {
  const { date } = req.query;
  
  const searchDate = date ? new Date(date) : new Date();
  searchDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(searchDate);
  nextDay.setDate(searchDate.getDate() + 1);

  const tasks = await prisma.task.findMany({
    where: { 
      userId: req.user.id,
      date: {
        gte: searchDate,
        lt: nextDay
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json(tasks);
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = asyncHandler(async (req, res) => {
  const { title, date } = req.body;
  
  const taskDate = date ? new Date(date) : new Date();
  taskDate.setHours(12, 0, 0, 0); // Noon to avoid timezone shifts

  const task = await prisma.task.create({
    data: {
      userId: req.user.id,
      title,
      date: taskDate
    }
  });

  res.status(201).json(task);
});

// @desc    Toggle task completion
// @route   PATCH /api/tasks/:id/toggle
// @access  Private
exports.toggleTask = asyncHandler(async (req, res) => {
  const taskId = parseInt(req.params.id);
  
  const task = await prisma.task.findUnique({
    where: { id: taskId }
  });

  if (!task || task.userId !== req.user.id) {
    res.status(404);
    throw new Error('Task not found');
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { isCompleted: !task.isCompleted }
  });

  // Reward XP for completing a task
  let xpResult = {};
  if (!task.isCompleted && updatedTask.isCompleted) {
    xpResult = await addXP(req.user.id, 5); // 5 XP per task
  } else if (task.isCompleted && !updatedTask.isCompleted) {
    xpResult = await addXP(req.user.id, -5);
  }

  res.status(200).json({ ...updatedTask, ...xpResult });
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = asyncHandler(async (req, res) => {
  const taskId = parseInt(req.params.id);

  const task = await prisma.task.findUnique({
    where: { id: taskId }
  });

  if (!task || task.userId !== req.user.id) {
    res.status(404);
    throw new Error('Task not found');
  }

  await prisma.task.delete({
    where: { id: taskId }
  });

  res.status(200).json({ message: 'Task removed' });
});
