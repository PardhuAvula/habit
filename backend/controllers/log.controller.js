const { subDays, isSameDay, startOfDay } = require('date-fns');
const prisma = require('../config/db');

// Create a log for a habit
exports.createLog = async (req, res) => {
  const { date, status, notes, value } = req.body;
  const habitId = parseInt(req.params.id);

  try {
    // Check if habit belongs to user
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: { streak: true }
    });

    if (!habit || habit.userId !== req.user.id) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Upsert log for the given date (start of day to avoid time mismatch)
    const logDate = startOfDay(new Date(date || new Date()));
    
    // Check if log already exists for this date
    let existingLog = await prisma.habitLog.findFirst({
        where: {
            habitId: habitId,
            date: {
                gte: logDate,
                lt: new Date(logDate.getTime() + 24 * 60 * 60 * 1000)
            }
        }
    });

    let log;
    if (existingLog) {
        log = await prisma.habitLog.update({
            where: { id: existingLog.id },
            data: { status, notes, value: value ? parseFloat(value) : null }
        });
    } else {
        log = await prisma.habitLog.create({
            data: {
                habitId,
                date: logDate,
                status,
                notes,
                value: value ? parseFloat(value) : null
            }
        });
    }

    // Update streaks automatically
    await updateStreaks(habitId);

    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get logs for a habit
exports.getLogs = async (req, res) => {
  try {
    const logs = await prisma.habitLog.findMany({
      where: { habitId: parseInt(req.params.id) },
      orderBy: { date: 'desc' },
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Internal function to update streaks
async function updateStreaks(habitId) {
    // Get all completed logs for this habit sorted by date descending
    const logs = await prisma.habitLog.findMany({
        where: { habitId, status: 'completed' },
        orderBy: { date: 'desc' }
    });

    if (logs.length === 0) {
        await prisma.streak.upsert({
            where: { habitId },
            update: { currentStreak: 0 },
            create: { habitId, currentStreak: 0, longestStreak: 0 }
        });
        return;
    }

    let currentStreak = 0;
    const today = startOfDay(new Date());
    const lastLogDate = startOfDay(logs[0].date);

    // If last completed log was not today or yesterday, streak is broken
    // (This simplified logic assumes daily frequency for streak)
    // For more complex frequencies, logic would vary.
    const dayDiff = Math.floor((today - lastLogDate) / (1000 * 60 * 60 * 24));

    if (dayDiff <= 1) {
        currentStreak = 1;
        for (let i = 0; i < logs.length - 1; i++) {
            const current = startOfDay(logs[i].date);
            const prev = startOfDay(logs[i+1].date);
            const diff = Math.floor((current - prev) / (1000 * 60 * 60 * 24));
            
            if (diff === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
    } else {
        currentStreak = 0;
    }

    const streakData = await prisma.streak.findUnique({ where: { habitId } });
    const longestStreak = Math.max(streakData?.longestStreak || 0, currentStreak);

    await prisma.streak.upsert({
        where: { habitId },
        update: { currentStreak, longestStreak },
        create: { habitId, currentStreak, longestStreak }
    });
}
