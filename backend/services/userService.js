const bcrypt = require('bcrypt');
const User = require('../models/userModel');

exports.registerUser = async (data) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) throw new Error('User already exists');
  const hashed = await bcrypt.hash(data.password, 10);
  const user = new User({ name: data.name || '', email: data.email, password: hashed });
  return await user.save();
};

exports.loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid email or password');
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error('Invalid email or password');
  return user;
};

exports.getAllUsers = async () => {
  return await User.find().select('-password');
};