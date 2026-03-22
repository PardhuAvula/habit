const asyncHandler = require('express-async-handler');
const prisma = require('../config/db');

// @desc    Get all habits for current user
// @route   GET /api/habits
// @access  Private
exports.getHabits = asyncHandler(async (req, res) => {
  const habits = await prisma.habit.findMany({
    where: { userId: req.user.id },
    include: {
      streak: true,
      logs: {
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          }
        },
        orderBy: { date: 'desc' },
        take: 1
      },

      _count: {
        select: { logs: { where: { status: 'completed' } } }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  // Map habits to indicate if completed today
  const mappedHabits = habits.map(h => ({
    ...h,
    completedToday: h.logs.length > 0 && h.logs[0].status === 'completed'
  }));

  
  res.status(200).json(mappedHabits);
});


// @desc    Create a new habit
// @route   POST /api/habits
// @access  Private
exports.createHabit = asyncHandler(async (req, res) => {
  const { title, description, category, frequency, targetValue, difficulty } = req.body;

  // Use a transaction to ensure both habit and streak are created
  const result = await prisma.$transaction(async (tx) => {
    const habit = await tx.habit.create({
      data: {
        userId: req.user.id,
        title,
        description,
        category,
        frequency,
        targetValue: targetValue ? parseFloat(targetValue) : null,
        difficulty: difficulty || 'medium',
        // Creating streak as part of nested write if possible, 
        // but prisma separate model without @relation(onDelete) might need manual
        streak: {
          create: {
            currentStreak: 0,
            longestStreak: 0,
          }
        }
      },
      include: {
        streak: true,
      },
    });
    return habit;
  });

  res.status(201).json(result);
});

// @desc    Update a habit
// @route   PUT /api/habits/:id
// @access  Private
exports.updateHabit = asyncHandler(async (req, res) => {
  const habitId = parseInt(req.params.id);
  
  // Verify ownership
  const existingHabit = await prisma.habit.findUnique({
    where: { id: habitId }
  });

  if (!existingHabit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  if (existingHabit.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this habit');
  }

  const { title, description, category, frequency, targetValue, difficulty } = req.body;

  const updatedHabit = await prisma.habit.update({
    where: { id: habitId },
    data: {
      title,
      description,
      category,
      frequency,
      targetValue: targetValue ? parseFloat(targetValue) : null,
      difficulty,
    },
  });

  res.status(200).json(updatedHabit);
});

const { addXP } = require('./user.controller');

// @desc    Log a habit (Complete/Miss)
// @route   POST /api/habits/:id/log
// @access  Private
exports.logHabit = asyncHandler(async (req, res) => {
  const habitId = parseInt(req.params.id);
  const { action, status } = req.body;

  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    include: { streak: true }
  });

  if (!habit || habit.userId !== req.user.id) {
    throw new Error('Habit not found');
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const existingLog = await prisma.habitLog.findFirst({
    where: { habitId, date: { gte: todayStart, lt: todayEnd } },
    orderBy: { date: 'desc' }
  });

  let currentCount = existingLog?.value ?? (existingLog?.status === 'completed' ? 1 : 0);
  let newCount = currentCount;

  if (action === 'increment') newCount++;
  else if (action === 'decrement') newCount = Math.max(0, newCount - 1);
  else if (status === 'completed') newCount = Math.max(1, newCount + 1);
  else if (status === 'missed') newCount = 0;

  let resolvedStatus = newCount > 0 ? 'completed' : 'missed';
  let updatedStreak = habit.streak?.currentStreak || 0;
  let xpChange = 0;

  // Streak & XP should ONLY change if we cross the 0<->1 boundary. Going from 1->2 shouldn't give MORE streak or XP.
  const crossingToCompleted = (!existingLog || existingLog.status === 'missed') && resolvedStatus === 'completed';
  const crossingToMissed = (existingLog && existingLog.status === 'completed') && resolvedStatus === 'missed';

  if (!action && existingLog && existingLog.status === status && (newCount === currentCount || status === 'completed')) {
    // If it's a legacy basic request and already correct, early return to save DB calls
    const finalHabit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: { streak: true, logs: { where: { date: { gte: todayStart, lt: todayEnd } }, orderBy: { date: 'desc' }, take: 1 } }
    });
    return res.status(200).json({ ...finalHabit, completedToday: finalHabit.logs[0]?.status === 'completed' });
  }

  await prisma.habitLog.deleteMany({
    where: { habitId, date: { gte: todayStart, lt: todayEnd } }
  });

  if (crossingToMissed) {
    updatedStreak = Math.max(0, updatedStreak - 1);
    xpChange = habit.difficulty === 'hard' ? -50 : habit.difficulty === 'medium' ? -25 : -10;
  } else if (crossingToCompleted) {
    updatedStreak = updatedStreak + 1;
    xpChange = habit.difficulty === 'hard' ? 50 : habit.difficulty === 'medium' ? 25 : 10;
  }

  // Update streak mathematically
  if (crossingToMissed || crossingToCompleted) {
    await prisma.streak.upsert({
      where: { habitId },
      update: {
        currentStreak: { set: updatedStreak },
        ...(crossingToCompleted ? { longestStreak: { set: Math.max(habit.streak?.longestStreak || 0, updatedStreak) } } : {})
      },
      create: { habitId, currentStreak: updatedStreak, longestStreak: updatedStreak }
    });
  }

  // Persist the daily count and state
  await prisma.habitLog.create({
    data: { habitId, status: resolvedStatus, value: newCount, date: new Date() }
  });

  const xpResult = await addXP(req.user.id, xpChange);
  
  const finalHabit = await prisma.habit.findUnique({
    where: { id: habitId },
    include: {
      streak: true,
      logs: {
        where: { date: { gte: todayStart, lt: todayEnd } },
        orderBy: { date: 'desc' },
        take: 1
      }
    }
  });

  res.status(200).json({ ...finalHabit, ...xpResult, completedToday: finalHabit.logs[0]?.status === 'completed' });
});



// @desc    Delete a habit
// @route   DELETE /api/habits/:id
// @access  Private
exports.deleteHabit = asyncHandler(async (req, res) => {
  const habitId = parseInt(req.params.id);

  // Verify ownership
  const existingHabit = await prisma.habit.findUnique({
    where: { id: habitId }
  });

  if (!existingHabit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  if (existingHabit.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this habit');
  }

  await prisma.habit.delete({
    where: { id: habitId },
  });

  res.status(200).json({ message: 'Habit deleted successfully' });
});

