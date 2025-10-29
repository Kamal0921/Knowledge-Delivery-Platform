// backend/routes/courseRoutes.js

const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize'); // Import the new middleware

// Public route: Any user can view courses
router.get('/', courseController.getAllCourses);

// New route: Get a single course by ID (must be authenticated)
router.get('/:id', auth, courseController.getCourseById);

// Protected routes
// Only 'admin' or 'instructor' can create a course 
router.post('/', auth, authorize(['admin', 'instructor']), courseController.createCourse);
router.put('/:id/enroll', auth, authorize(['student']), courseController.enrollStudent);
router.put('/:id/progress', auth, authorize(['student']), courseController.updateProgress);

// Only 'student' can enroll
router.put('/:id/enroll', auth, authorize(['student']), courseController.enrollStudent);

// Only 'student' can update their own progress
router.put('/:id/progress', auth, authorize(['student']), courseController.updateProgress);

// Only 'student' can get quiz questions
router.get('/:id/quiz', auth, authorize(['student']), courseController.getQuizQuestions);

// PUT: Instructor/Admin sets/updates the quiz questions
router.put('/:id/quiz', auth, authorize(['admin', 'instructor']), courseController.updateQuiz); 

// POST: Student submits their score
// (Note: I'm moving this to /quiz/submit to avoid conflict with the PUT route)
router.post('/:id/quiz/submit', auth, authorize(['student']), courseController.submitScore);

// Only 'student' can submit a quiz/score 
router.post('/:id/quiz', auth, authorize(['student']), courseController.submitScore);

module.exports = router;
