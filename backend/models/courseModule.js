const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  progress: { type: Map, of: Number, default: {} },
  quizQuestions: [{ question: String, options: [String], answer: String }],
  scores: { type: Map, of: Number, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);