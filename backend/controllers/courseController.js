// backend/controllers/courseController.js
const courseService = require('../services/courseService');
const mongoose = require('mongoose');
const multer = require('multer');

// --- HELPER FUNCTIONS ---
// This helper validates, trims, and returns the clean ID
const validateCourseId = (res, id) => {
    if (!id) {
        res.status(400).json({ error: 'Missing Course ID.' });
        return false;
    }
    const trimmedId = id.trim(); // Trim whitespace
    if (!mongoose.Types.ObjectId.isValid(trimmedId)) { // Check the trimmed ID
        res.status(400).json({ error: `Invalid Course ID format: "${id}"` });
        return false;
    }
    return trimmedId; // Return the clean, valid ID
};

// Helper for Module ID
const validateModuleId = (res, id) => {
    if (!id) {
        res.status(400).json({ error: 'Missing Module ID.' });
        return false;
    }
    const trimmedId = id.trim();
    if (!mongoose.Types.ObjectId.isValid(trimmedId)) {
        res.status(400).json({ error: `Invalid Module ID format: "${id}"` });
        return false;
    }
    return trimmedId;
};
// --- END HELPERS ---

exports.createCourse = async (req, res) => {
  try {
    const { title, description, category } = req.body;
     if (!title) { return res.status(400).json({ error: 'Course title is required.' }); }
    let imageUrl = null;
    if (req.file) { imageUrl = `/uploads/${req.file.filename}`; }
    const courseData = { title, description: description || '', imageUrl: imageUrl, category: category || 'General' };
    const newCourse = await courseService.createCourse(courseData);
    res.status(201).json(newCourse);
  } catch (err) {
    console.error("Error creating course:", err);
    if (err instanceof multer.MulterError || (err.message && err.message.startsWith('Invalid file type'))) {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await courseService.getAllCourses();
    res.status(200).json(courses);
  } catch (err) {
    console.error("Error getting all courses:", err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const courseId = validateCourseId(res, req.params.id); // Use clean ID
    if (!courseId) return;
    const requestingUserId = req.user?.id;
    const requestingUserRole = req.user?.role;
    const course = await courseService.findCourseById(courseId, requestingUserId, requestingUserRole);
    if (!course) { return res.status(404).json({ error: 'Course not found' }); }
    res.status(200).json(course);
  } catch (err) {
    console.error(`Error getting course by ID (${req.params.id}):`, err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};

exports.enrollStudent = async (req, res) => {
  try {
    const courseId = validateCourseId(res, req.params.id); // Use clean ID
    if (!courseId) return;
    if (!req.user || !req.user.id) { return res.status(401).json({ error: 'Authentication required.' }); }
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
    const courseId = validateCourseId(res, req.params.id); // Use clean ID
    if (!courseId) return;
    const { title, content, resources } = req.body;
    if (!title) { return res.status(400).json({ error: 'Module title is required.' }); }
    const bodyResources = Array.isArray(resources) ? resources : (resources ? [resources] : []);
    const uploaded = (req.files || []).map(f => `/uploads/${f.filename}`);
    const moduleData = { title, content: content || '', resources: [...bodyResources, ...uploaded] };
    const updated = await courseService.addModule(courseId, moduleData);
    res.status(200).json(updated);
  } catch (err) {
    console.error(`Error adding module to course (${req.params.id}):`, err);
     if (err instanceof multer.MulterError || (err.message && err.message.startsWith('Invalid file type'))) {
         return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};

// --- UPDATE: updateCourse ---
exports.updateCourse = async (req, res) => {
    try {
        const courseId = validateCourseId(res, req.params.id); // Get clean ID
        if (!courseId) return; // Error already sent
        
        const { title, description, category } = req.body;
        const updateData = {};

        if (title !== undefined && !title.trim()) {
            return res.status(400).json({ error: 'Course title cannot be empty.' });
        }
        
        if (title) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (category) updateData.category = category;
        if (req.file) {
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }

        const updatedCourse = await courseService.updateCourse(courseId, updateData); // Pass clean ID
        res.status(200).json(updatedCourse);
    } catch (err) {
        console.error("Error updating course:", err);
        if (err instanceof multer.MulterError || (err.message && err.message.startsWith('Invalid file type'))) {
            return res.status(400).json({ error: err.message });
        }
        res.status(err.message === 'Course not found' ? 404 : 500).json({ error: err.message || 'Internal Server Error' });
    }
};
// --- END UPDATE ---

exports.deleteCourse = async (req, res) => {
    try {
        const courseId = validateCourseId(res, req.params.id); // Get clean ID
        if (!courseId) {
            console.log("[Controller] Invalid ID format.");
            return; // Response already sent
        }
        await courseService.deleteCourse(courseId); // Pass clean ID
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (err) {
        console.error("[Controller] Error deleting course:", err.message);
        if (err.message === 'Course not found') {
            res.status(404).json({ error: 'Course not found' });
        } else {
            res.status(500).json({ error: err.message || 'Internal Server Error' });
        }
    }
};

// --- Module Quiz Controllers (with ID validation) ---
exports.getModuleQuiz = async (req, res) => {
  try {
    const courseId = validateCourseId(res, req.params.courseId);
    const moduleId = validateModuleId(res, req.params.moduleId);
    if (!courseId || !moduleId) return;
    const questions = await courseService.getModuleQuizQuestions(courseId, moduleId);
    const questionsForStudent = questions.map(q => ({ question: q.question, options: q.options, _id: q._id }));
    res.status(200).json(questionsForStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateModuleQuiz = async (req, res) => {
  try {
    const courseId = validateCourseId(res, req.params.courseId);
    const moduleId = validateModuleId(res, req.params.moduleId);
    if (!courseId || !moduleId) return;
    const { questions } = req.body; 
    if (!Array.isArray(questions)) { return res.status(400).json({ error: 'Request body must contain a "questions" array.' }); }
    const updatedQuestions = await courseService.updateModuleQuiz(courseId, moduleId, questions);
    res.status(200).json(updatedQuestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitModuleScore = async (req, res) => {
  try {
    const courseId = validateCourseId(res, req.params.courseId);
    const moduleId = validateModuleId(res, req.params.moduleId);
    if (!courseId || !moduleId) return;
    const { answers } = req.body; 
    const studentId = req.user.id;
    if (!answers) { return res.status(400).json({ error: 'Answers object is required.' }); }
    const result = await courseService.submitModuleScore(courseId, moduleId, studentId, answers);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};