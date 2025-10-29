const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    await userService.registerUser({ name, email, password });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userService.loginUser(email, password);

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'default_jwt_secret', { expiresIn: '1d' });
    res.json({ message: 'Login successful', token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};