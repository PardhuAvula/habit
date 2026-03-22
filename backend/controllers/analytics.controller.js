const { subDays, subMonths, format } = require('date-fns');
const prisma = require('../config/db');
const asyncHandler = require('express-async-handler');

// @desc    Get weekly summary
// @route   GET /api/analytics/weekly
// @access  Private
exports.getWeeklySummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const startDay = subDays(new Date(), 7);

  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      logs: {
        where: {
          date: { gte: startDay },
          status: 'completed',
        },
      },
    },
  });

  const summary = habits.map((h) => ({
    id: h.id,
    title: h.title,
    completedCount: h.logs.length,
    completionRate: (h.logs.length / 7) * 100,
  }));

  res.status(200).json(summary);
});

// @desc    Get monthly summary (Grouped by Day)
// @route   GET /api/analytics/monthly
// @access  Private
exports.getMonthlySummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const startDay = subMonths(new Date(), 1);

  const logs = await prisma.habitLog.findMany({
    where: {
      status: 'completed',
      habit: { userId },
      date: { gte: startDay },
    },
    select: { date: true },
  });

  // Group logs by day to get frequency of completion
  const days = {};
  logs.forEach((log) => {
    const day = format(log.date, 'yyyy-MM-dd');
    days[day] = (days[day] || 0) + 1;
  });

  res.status(200).json(days);
});

// @desc    Get Heatmap data for last year
// @route   GET /api/analytics/heatmap
// @access  Private
exports.getHeatmapData = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const oneYearAgo = subDays(new Date(), 365);

  const logs = await prisma.habitLog.findMany({
    where: {
      status: 'completed',
      habit: { userId },
      date: { gte: oneYearAgo },
    },
    select: { date: true },
  });

  const heatmap = {};
  logs.forEach((log) => {
    const date = format(log.date, 'yyyy-MM-dd');
    heatmap[date] = (heatmap[date] || 0) + 1;
  });

  const result = Object.entries(heatmap).map(([date, count]) => ({
    date,
    count,
  }));

  res.status(200).json(result);
});
