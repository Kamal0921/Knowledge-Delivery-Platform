// backend/models/courseModule.js
const mongoose = require('mongoose');

const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },
  resources: [{ type: String }],
  quizQuestions: [
    {
      question: String,
      options: [String],
      answer: String
    }
  ],
  scores: {
    type: Map,
    of: Number, // studentId -> score
    default: {}
  }
});

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  imageUrl: { type: String },
  // --- ADDED FIELD ---
  category: {
    type: String,
    trim: true,
    default: 'General' // Default category if none is provided
  },
  // --- END ADDED FIELD ---
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  progress: { type: Map, of: Number, default: {} }, // studentId -> progress %
  highestCompletedModule: {
    type: Map,
    of: Number, // studentId -> moduleIndex (0-based)
    default: {}
  },
  modules: [ModuleSchema],

}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);