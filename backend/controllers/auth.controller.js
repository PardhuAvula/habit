const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const asyncHandler = require('express-async-handler');
const { getUnlockedAchievements } = require('./user.controller');


/**
 * Standard User Selection for consistency
 */
const userSelect = {
  id: true,
  name: true,
  email: true,
  profileImage: true,
  xp: true,
  level: true,
  createdAt: true,
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, password } = req.body;
  const email = req.body.email.toLowerCase();

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      xp: 0,
      level: 1,
    },
    select: userSelect,
  });

  const accessToken = exports.generateAccessToken(user);
  const refreshToken = exports.generateRefreshToken(user);

  const achievements = await getUnlockedAchievements(user);

  res.status(201).json({ user: { ...user, achievements }, accessToken, refreshToken });
});


// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const email = req.body.email.toLowerCase();

  const user = await prisma.user.findUnique({ 
    where: { email },
    select: { ...userSelect, password: true } // Need password for compare
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Remove password from response
  const { password: _, ...userResponse } = user;

  const accessToken = exports.generateAccessToken(userResponse);
  const refreshToken = exports.generateRefreshToken(userResponse);

  const achievements = await getUnlockedAchievements(userResponse);

  res.status(200).json({ user: { ...userResponse, achievements }, accessToken, refreshToken });
});


// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    res.status(401);
    throw new Error('Token required for refresh');
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await prisma.user.findUnique({ 
    where: { id: decoded.id },
    select: userSelect,
  });

  if (!user) {
    res.status(401);
    throw new Error('User no longer exists');
  }

  const newAccessToken = exports.generateAccessToken(user);
  res.status(200).json({ accessToken: newAccessToken });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: userSelect,
  });

  if (!user) {
    res.status(404);
    throw new Error('User profile not found');
  }

  const achievements = await getUnlockedAchievements(user);

  res.status(200).json({ ...user, achievements });
});


// Helpers
exports.generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '1h' }
  );
};

exports.generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id }, 
    process.env.JWT_REFRESH_SECRET, 
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d' }
  );
};
