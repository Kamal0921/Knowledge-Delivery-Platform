// backend/controllers/courseController.js

const courseService = require('../services/courseService');

exports.createCourse = async (req, res) => {
  try {
    // req.body should contain { title, description, quizQuestions }
    const newCourse = await courseService.createCourse(req.body);
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await courseService.getAllCourses();
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.enrollStudent = async (req, res) => {
  try {
    // The student ID comes from the authenticated user's token
    const studentId = req.user.id; 
    const courseId = req.params.id;
    
    const updatedCourse = await courseService.enrollStudent(courseId, studentId);
    res.status(200).json(updatedCourse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    // SRS specifies progress as a query param [cite: 284]
    const { progress } = req.query; 
    const studentId = req.user.id; // Student updates their own progress
    const courseId = req.params.id;

    if (!progress) {
      return res.status(400).json({ error: 'Progress query parameter is required.' });
    }

    const updated = await courseService.updateProgress(courseId, studentId, progress);
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getQuizQuestions = async (req, res) => {
  try {
    const questions = await courseService.getQuizQuestions(req.params.id);
    // Hide answers before sending to student
    const questionsForStudent = questions.map(q => ({
      question: q.question,
      options: q.options,
      _id: q._id // Need id for mapping answers
    }));
    res.status(200).json(questionsForStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitScore = async (req, res) => {
  try {
    // SRS specifies score as a query param [cite: 289]
    const { score } = req.query; 
    const studentId = req.user.id;
    const courseId = req.params.id;

     if (!score) {
      return res.status(400).json({ error: 'Score query parameter is required.' });
    }

    const result = await courseService.submitScore(courseId, studentId, score);
    res.status(200).json({ message: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await courseService.findCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// backend/controllers/courseController.js
// ... (keep all existing functions)

exports.updateQuiz = async (req, res) => {
  try {
    // Expecting a body like { questions: [...] }
    const { questions } = req.body; 
    
    if (!Array.isArray(questions)) {
      return res.status(400).json({ error: 'Request body must contain a "questions" array.' });
    }

    const updatedQuestions = await courseService.updateQuiz(req.params.id, questions);
    res.status(200).json(updatedQuestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};