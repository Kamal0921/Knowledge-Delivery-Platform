// backend/controllers/courseController.js
const courseService = require('../services/courseService');
const mongoose = require('mongoose');
const multer = require('multer');
// Import Multer to check for MulterError instance
const path = require('path');
const fs = require('fs');
// Only needed in service now

exports.createCourse = async (req, res) => {
  try {
    // Get new fields from req.body
    const { title, description, category, difficulty } = req.body;
if (!title) { return res.status(400).json({ error: 'Course title is required.' }); }
    let imageUrl = null;
if (req.file) { imageUrl = `/uploads/${req.file.filename}`; }
    
    // Pass new fields to the service
    const courseData = {
      title,
      description: description || '',
      imageUrl: imageUrl,
      category: category || 'Other', // Add category
      difficulty: difficulty || 'Beginner' // Add difficulty
    };
    
    const newCourse = await courseService.createCourse(courseData);
    res.status(201).json(newCourse);
} catch (err) {
    console.error("Error creating course:", err);
if (err instanceof multer.MulterError || err.message.startsWith('Invalid file type')) {
        return res.status(400).json({ error: err.message });
}
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    // 1. Get query params from req.query
    const { search, category, difficulty } = req.query;

    // 2. Pass them to the service
    const courses = await courseService.getAllCourses({ search, category, difficulty });
    
    res.status(200).json(courses);
} catch (err) {
    console.error("Error getting all courses:", err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
}
};

exports.getCourseById = async (req, res) => {
  try {
    const requestingUserId = req.user?.id;
const requestingUserRole = req.user?.role;
    const course = await courseService.findCourseById(req.params.id, requestingUserId, requestingUserRole);
if (!course) { return res.status(404).json({ error: 'Course not found' }); }
    res.status(200).json(course);
} catch (err) {
    console.error(`Error getting course by ID (${req.params.id}):`, err);
res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};

exports.enrollStudent = async (req, res) => {
  try {
    const courseId = req.params.id;
if (!req.user || !req.user.id) { return res.status(401).json({ error: 'Authentication required.' });
}
    const { studentId } = req.body;
if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ error: 'Valid studentId is required in request body.' });
}
    const updatedCourse = await courseService.enrollStudent(courseId, studentId);
    res.status(200).json(updatedCourse);
} catch (err) {
    console.error(`Error enrolling student (${req.body.studentId}) in course (${req.params.id}):`, err);
res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};

exports.addModule = async (req, res) => {
  try {
    const courseId = req.params.id;
const { title, content, resources } = req.body;
    if (!title) { return res.status(400).json({ error: 'Module title is required.' });
}
    const bodyResources = Array.isArray(resources) ? resources : (resources ? [resources] : []);
const uploaded = (req.files || []).map(f => `/uploads/${f.filename}`);
    const moduleData = { title, content: content || '', resources: [...bodyResources, ...uploaded] };
    const updated = await courseService.addModule(courseId, moduleData);
    res.status(200).json(updated);
} catch (err) {
    console.error(`Error adding module to course (${req.params.id}):`, err);
if (err instanceof multer.MulterError || err.message.startsWith('Invalid file type')) {
         return res.status(400).json({ error: err.message });
}
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};

// --- ADD: Update Course Controller ---
exports.updateCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        // 1. Get new fields from req.body
        const { title, description, category, difficulty } = req.body;
        const updateData = {};
        
        // Basic validation
        if (title !== undefined && !title.trim()) {
            return res.status(400).json({ error: 'Course title cannot be empty.' });
}

        if (title !== undefined) updateData.title = title;
        // Allow setting description to empty string
        if (description !== undefined) updateData.description = description;
        
        // 2. Add new fields to updateData
        if (category !== undefined) updateData.category = category;
        if (difficulty !== undefined) updateData.difficulty = difficulty;

        // Check if a new image was uploaded
        if (req.file) {
            updateData.imageUrl = `/uploads/${req.file.filename}`;
}

        const updatedCourse = await courseService.updateCourse(courseId, updateData);

        res.status(200).json(updatedCourse);
} catch (err) {
        console.error("Error updating course:", err);
if (err instanceof multer.MulterError || err.message.startsWith('Invalid file type')) {
            return res.status(400).json({ error: err.message });
}
        res.status(err.message === 'Course not found' ? 404 : 500).json({ error: err.message || 'Internal Server Error' });
}
};
// --- END ADD ---

// --- ADD: Delete Course Controller ---
exports.deleteCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
if (!mongoose.Types.ObjectId.isValid(courseId)) {
           return res.status(400).json({ error: 'Invalid Course ID format.' });
}
        await courseService.deleteCourse(courseId);
        res.status(200).json({ message: 'Course deleted successfully' });
} catch (err) {
        console.error("Error deleting course:", err);
res.status(err.message === 'Course not found' ? 404 : 500).json({ error: err.message || 'Internal Server Error' });
    }
};
// --- END ADD ---


// --- Module Quiz Controllers (Unchanged) ---
exports.getModuleQuiz = async (req, res) => { /* ... */ };
exports.updateModuleQuiz = async (req, res) => { /* ... */ };
exports.submitModuleScore = async (req, res) => { /* ... */ };