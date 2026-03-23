const asyncHandler = require('express-async-handler');
const prisma = require('../config/db');
const bcrypt = require('bcryptjs');


exports.getUnlockedAchievements = async (user) => {

  const achievements = [
    { id: 'welcome', title: 'Fresh Start', icon: '🌟', description: 'Begin your habit tracking journey', unlocked: true },
  ];

  // Longest Streak Check
  const maxStreak = await prisma.streak.findFirst({
    where: { habit: { userId: user.id } },
    orderBy: { longestStreak: 'desc' },
  });
  
  if (maxStreak && maxStreak.longestStreak >= 7) {
    achievements.push({ id: 'streak_7', title: 'Consistency King', icon: '🔥', description: 'Maintain a 7-day streak on any habit', unlocked: true });
  }

  // Habit Count Check
  const habitCount = await prisma.habit.count({ where: { userId: user.id } });
  if (habitCount >= 3) {
    achievements.push({ id: 'ambition', title: 'Highly Ambitious', icon: '🎯', description: 'Create 3 or more active habits', unlocked: true });
  }

  // Level Check
  if (user.level >= 5) {
    achievements.push({ id: 'veteran', title: 'Experienced Tracker', icon: '🛡️', description: 'Reach Level 5 or higher', unlocked: true });
  }

  return achievements;
};

// @desc    Update user profile photo
// @route   PUT /api/users/profile-photo
// @access  Private
exports.updateProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image');
  }

  const profileImage = `/uploads/${req.file.filename}`;

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: { profileImage },
    select: { id: true, name: true, email: true, profileImage: true, level: true, xp: true, createdAt: true }
  });

  const achievements = await getUnlockedAchievements(updatedUser);

  res.status(200).json({ ...updatedUser, achievements });
});


// @desc    Get user stats (XP, level)
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, level: true, xp: true }
  });

  res.status(200).json(user);
});

// @desc    Update user profile (name, email)
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const email = req.body.email ? req.body.email.toLowerCase() : undefined;

  // Check if email already taken
  if (email && email !== req.user.email) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400);
      throw new Error('Email already taken');
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, email },
    select: { id: true, name: true, email: true, profileImage: true, level: true, xp: true, createdAt: true }
  });

  const achievements = await exports.getUnlockedAchievements(updatedUser);

  res.status(200).json({ ...updatedUser, achievements });
});


// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide both old and new passwords');
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid old password');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedPassword }
  });

  res.status(200).json({ message: 'Password changed successfully' });
});

// @desc    Add XP (called internally on certain actions)
exports.addXP = async (userId, amount) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  let newXP = Math.max(0, user.xp + amount);
  let newLevel = user.level;


  // Level up logic (e.g., each level requires Level * 100 XP)
  const xpThreshold = newLevel * 100;
  if (newXP >= xpThreshold) {
    newXP -= xpThreshold;
    newLevel += 1;
  }

  const leveledUp = newLevel > user.level;

  await prisma.user.update({
    where: { id: userId },
    data: { xp: newXP, level: newLevel }
  });

  return { xp: newXP, level: newLevel, leveledUp };
};

