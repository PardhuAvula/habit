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
        orderBy: { date: 'desc' }
      },
      _count: {
        select: { logs: { where: { status: 'completed' } } }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Map habits, recalculate their streak if broken, and determine today's completion
  const mappedHabits = await Promise.all(habits.map(async (h) => {
    let currentStreak = 0;
    let longestStreak = h.streak?.longestStreak || 0;
    
    // Evaluate streak based on logs
    const completedLogs = h.logs.filter(l => l.status === 'completed');
    if (completedLogs.length > 0) {
      let tempStreak = 0;
      let checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);
      
      let isCompletedToday = completedLogs.some(l => {
        let d = new Date(l.date); d.setHours(0,0,0,0); return d.getTime() === checkDate.getTime();
      });

      if (isCompletedToday) {
        tempStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Not completed today. Check yesterday.
        checkDate.setDate(checkDate.getDate() - 1);
        let isCompletedYesterday = completedLogs.some(l => {
          let d = new Date(l.date); d.setHours(0,0,0,0); return d.getTime() === checkDate.getTime();
        });
        if (!isCompletedYesterday) {
          tempStreak = 0; // Streak is broken
        }
      }

      if (tempStreak > 0 || checkDate.getTime() < new Date().setHours(0,0,0,0)) {
         // Keep counting backwards
         while (true) {
            let logFound = completedLogs.some(l => {
               let d = new Date(l.date); d.setHours(0,0,0,0); return d.getTime() === checkDate.getTime();
            });
            if (logFound) {
               tempStreak++;
               checkDate.setDate(checkDate.getDate() - 1);
            } else {
               break;
            }
         }
      }
      currentStreak = tempStreak;
    }

    if (!h.streak || h.streak.currentStreak !== currentStreak) {
      await prisma.streak.upsert({
        where: { habitId: h.id },
        update: {
          currentStreak: currentStreak,
          longestStreak: Math.max(longestStreak, currentStreak)
        },
        create: {
          habitId: h.id,
          currentStreak: currentStreak,
          longestStreak: Math.max(longestStreak, currentStreak)
        }
      });
      h.streak = { ...h.streak, currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
    }

    const completedToday = h.logs.some(l => l.status === 'completed' && new Date(l.date).setHours(0,0,0,0) === todayStart.getTime());
    
    return {
      ...h,
      completedToday,
      logs: h.logs.filter(l => new Date(l.date).setHours(0,0,0,0) === todayStart.getTime()).slice(0,1) // only send today's logs back to frontend
    };
  }));

  res.status(200).json(mappedHabits);
});


// @desc    Create a new habit
// @route   POST /api/habits
// @access  Private
exports.createHabit = asyncHandler(async (req, res) => {
  const { title, description, category, frequency, targetValue, difficulty, goalId, frequencyDays, customDate } = req.body;
  const parsedGoalId = (goalId && goalId !== "" && goalId !== "undefined") ? parseInt(goalId) : null;

  try {
    const habit = await prisma.habit.create({
      data: {
        userId: req.user.id,
        title,
        description,
        category,
        frequency,
        frequencyDays: frequency === 'weekly' ? "1,2,3,4,5" : frequencyDays, // Weekly = Weekdays
        customDate: (frequency === 'custom' && customDate) ? new Date(customDate) : null,
        targetValue: targetValue ? parseFloat(targetValue) : null,
        difficulty: difficulty || 'medium',
        goalId: isNaN(parsedGoalId) ? null : parsedGoalId,
      }
    });

    // Create the streak for the habit
    await prisma.streak.create({
      data: {
        habitId: habit.id,
        currentStreak: 0,
        longestStreak: 0,
      }
    });

    // Return the habit with the created streak
    const habitWithStreak = await prisma.habit.findUnique({
      where: { id: habit.id },
      include: { streak: true }
    });

    res.status(201).json(habitWithStreak);
  } catch (error) {
    console.error('HABIT CREATION ERROR:', error);
    res.status(500).json({ 
      message: 'Failed to create habit', 
      error: error.message
    });
  }
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

  const { title, description, category, frequency, targetValue, difficulty, goalId, frequencyDays, customDate } = req.body;
  const parsedGoalId = (goalId && goalId !== "") ? parseInt(goalId) : null;

  const updatedHabit = await prisma.habit.update({
    where: { id: habitId },
    data: {
      title,
      description,
      category,
      frequency,
      frequencyDays: frequency === 'weekly' ? "1,2,3,4,5" : frequencyDays, 
      customDate: (frequency === 'custom' && customDate) ? new Date(customDate) : null,
      targetValue: targetValue ? parseFloat(targetValue) : null,
      difficulty,
      goalId: isNaN(parsedGoalId) ? null : parsedGoalId,
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

  if (action === 'increment') newCount = 1; // Since user only wants 0 or 1 now
  else if (action === 'decrement') newCount = 0;
  else if (status === 'completed') newCount = 1;
  else if (status === 'missed') newCount = 0;

  let resolvedStatus = newCount > 0 ? 'completed' : 'missed';

  const crossingToCompleted = (!existingLog || existingLog.status !== 'completed') && resolvedStatus === 'completed';
  const crossingToMissed = (existingLog && existingLog.status === 'completed') && resolvedStatus !== 'completed';

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

  // Persist the daily count and state
  await prisma.habitLog.create({
    data: { habitId, status: resolvedStatus, value: newCount, date: new Date() }
  });

  // Recalculate Streak thoroughly
  const allLogs = await prisma.habitLog.findMany({
    where: { habitId, status: 'completed' },
    orderBy: { date: 'desc' }
  });

  let currentStreak = 0;
  let longestStreak = habit.streak?.longestStreak || 0;
  
  if (allLogs.length > 0) {
    let tempStreak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    
    let isCompletedToday = allLogs.some(l => {
      let d = new Date(l.date); d.setHours(0,0,0,0); return d.getTime() === checkDate.getTime();
    });

    if (isCompletedToday) {
      tempStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      let isCompletedYesterday = allLogs.some(l => {
        let d = new Date(l.date); d.setHours(0,0,0,0); return d.getTime() === checkDate.getTime();
      });
      if (!isCompletedYesterday) tempStreak = 0;
    }

    if (tempStreak > 0 || checkDate.getTime() < new Date().setHours(0,0,0,0)) {
       while (true) {
          let logFound = allLogs.some(l => {
             let d = new Date(l.date); d.setHours(0,0,0,0); return d.getTime() === checkDate.getTime();
          });
          if (logFound) {
             tempStreak++;
             checkDate.setDate(checkDate.getDate() - 1);
          } else {
             break;
          }
       }
    }
    currentStreak = tempStreak;
  }

  await prisma.streak.upsert({
    where: { habitId },
    update: {
      currentStreak: currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak)
    },
    create: { habitId, currentStreak: currentStreak, longestStreak: Math.max(longestStreak, currentStreak) }
  });

  let xpChange = 0;
  if (crossingToMissed) {
    xpChange = habit.difficulty === 'hard' ? -50 : habit.difficulty === 'medium' ? -25 : -10;
  } else if (crossingToCompleted) {
    xpChange = habit.difficulty === 'hard' ? 50 : habit.difficulty === 'medium' ? 25 : 10;
  }
  
  let xpResult = {};
  if (xpChange !== 0) {
     xpResult = await addXP(req.user.id, xpChange);
  } else {
     // Default XP res if no change
     const u = await prisma.user.findUnique({ where: { id: req.user.id } });
     xpResult = { xp: u.xp, level: u.level, leveledUp: false };
  }

  // Handle Objective/Goal linkage
  if (habit.goalId && (crossingToCompleted || crossingToMissed)) {
      await prisma.goal.update({
          where: { id: habit.goalId },
          data: {
              currentValue: {
                  increment: crossingToCompleted ? 1 : -1
              }
          }
      });
  }
  
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

