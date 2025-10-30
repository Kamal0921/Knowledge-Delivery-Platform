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
  // --- ADDED FIELD ---
  imageUrl: { type: String }, // To store the URL/path of the course image
  
  // --- ADDED FIELDS (FROM PREVIOUS REQUEST) ---
  category: {
    type: String,
    enum: ['Technology', 'Business', 'Creative Arts', 'Health & Wellness', 'Science', 'Other'],
    default: 'Other'
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  // --- END ADDED FIELDS ---

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