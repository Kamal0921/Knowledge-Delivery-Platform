const Course = require('../models/courseModule');

exports.createCourse = async (data) => {
  const course = new Course(data);
  return await course.save();
};

exports.getAllCourses = async () => {
  return await Course.find();
};

exports.findCourseById = async (id) => {
  return await Course.findById(id);
};

exports.enrollStudent = async (id, studentId) => {
  const course = await Course.findById(id);
  if (!course) throw new Error('Course not found');

  if (!course.enrolledStudents.includes(studentId)) {
    course.enrolledStudents.push(studentId);
    await course.save();
  }
  return course;
};

exports.updateProgress = async (id, studentId, progress) => {
  const course = await Course.findById(id);
  if (!course) throw new Error('Course not found');

  course.progress.set(studentId, Number(progress));
  await course.save();
  return course;
};

exports.getQuizQuestions = async (id) => {
  const course = await Course.findById(id);
  if (!course) throw new Error('Course not found');

  return course.quizQuestions || [];
};

exports.submitScore = async (id, studentId, score) => {
  const course = await Course.findById(id);
  if (!course) throw new Error('Course not found');

  course.scores.set(studentId, Number(score));
  await course.save();
  return 'Score submitted!';
};

exports.updateQuiz = async (id, questions) => {
  const course = await Course.findById(id);
  if (!course) throw new Error('Course not found');

  // Overwrite the existing quiz questions
  course.quizQuestions = questions;
  
  await course.save();
  return course.quizQuestions;
};