// backend/services/courseService.js
const Course = require('../models/courseModule');
const User = require('../models/userModel');
const fs = require('fs'); // Import File System
const path = require('path');
// Import Path

// Function to safely delete a file
const deleteFile = (filePath) => {
    if (!filePath) return;
// Don't attempt if path is null or empty
    // filePath should be relative from the server root, e.g., '/uploads/imagename.png'
    const absolutePath = path.join(__dirname, '..', filePath);
// Navigate up from 'services' to backend root
    fs.unlink(absolutePath, (err) => {
        if (err && err.code !== 'ENOENT') { // Ignore error only if file doesn't exist
            console.error(`Error deleting file ${absolutePath}:`, err);
        } else if (!err) {
             console.log(`Deleted file: ${absolutePath}`);
        } else {
           
  console.log(`File not found, skipping delete: ${absolutePath}`);
        }
    });
};


exports.createCourse = async (data) => {
  // Data now includes title, description, imageUrl, category, difficulty
  const course = new Course(data);
  return await course.save();
};

exports.getAllCourses = async (queryParams) => {
  const { search, category, difficulty } = queryParams;

  let query = {};

  // 1. Add search query (case-insensitive regex on title)
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }
  // 2. Add category filter
  if (category) {
    query.category = category;
  }
  // 3. Add difficulty filter
  if (difficulty) {
    query.difficulty = difficulty;
  }

  // Find all courses matching the dynamic query
  return await Course.find(query).sort({ createdAt: -1 });
};

exports.findCourseById = async (id, requestingUserId, requestingUserRole) => {
  try {
    const course = await Course.findById(id)
      .populate({ path: 'enrolledStudents', model: 'User', select: 'name email _id' });
if (!course) return null;
    course.enrolledStudents = (course.enrolledStudents || []).filter(student => student !== null);
// Sequential Logic
    if (requestingUserRole === 'student') {
        const studentIdStr = requestingUserId.toString();
const highestCompletedIndex = course.highestCompletedModule?.get(studentIdStr) ?? -1;
        const nextAvailableIndex = highestCompletedIndex + 1;
course.modules = (course.modules || []).map((module, index) => (
            index <= nextAvailableIndex
                ? { ...module.toObject(), isLocked: false }
                : { _id: module._id, title: module.title, isLocked: true }
        ));
} else {
      course.modules = (course.modules || []).map(module => ({ ...module.toObject(), isLocked: false }));
}
    return course;
  } catch (error) {
    console.error("Error populating/filtering:", error);
    return await Course.findById(id);
// Fallback without populate/filter
  }
};

exports.enrollStudent = async (id, studentId) => {
  const course = await Course.findById(id);
if (!course) throw new Error('Course not found');
  course.enrolledStudents = course.enrolledStudents || [];
const isAlreadyEnrolled = course.enrolledStudents.some(enrolledStudent => enrolledStudent && enrolledStudent.toString() === studentId.toString());
  if (!isAlreadyEnrolled) {
    course.enrolledStudents.push(studentId);
    await course.save();
}
  return await Course.findById(id).populate('enrolledStudents', 'name email _id');
};

exports.addModule = async (id, moduleData) => {
  const course = await Course.findById(id);
if (!course) throw new Error('Course not found');
  course.modules = course.modules || [];
  course.modules.push(moduleData);
  await course.save();
  return course;
};
// --- ADD: Update Course Service ---
exports.updateCourse = async (courseId, updateData) => {
    const course = await Course.findById(courseId);
if (!course) {
        throw new Error('Course not found');
}

    let oldImageUrl = course.imageUrl; // Store old image path before potentially updating

    // Update course fields from updateData
    if (updateData.title !== undefined) course.title = updateData.title;
if (updateData.description !== undefined) course.description = updateData.description;
    if (updateData.imageUrl !== undefined) course.imageUrl = updateData.imageUrl;

    // --- ADDED: Handle new fields ---
    if (updateData.category !== undefined) course.category = updateData.category;
    if (updateData.difficulty !== undefined) course.difficulty = updateData.difficulty;
    // --- END ADD ---

    const updatedCourse = await course.save();
// If a new image URL was part of the update and an old one existed, delete the old file
    if (updateData.imageUrl && oldImageUrl && updateData.imageUrl !== oldImageUrl) {
        deleteFile(oldImageUrl);
// Pass the relative path stored in the DB
    }

    // Repopulate enrolled students before returning (optional but good for consistency)
    return await Course.findById(updatedCourse._id).populate('enrolledStudents', 'name email _id');
};
// --- END ADD ---

// --- ADD: Delete Course Service ---
exports.deleteCourse = async (courseId) => {
    // Find the course first to get its details before deleting
    const course = await Course.findById(courseId);
if (!course) {
        throw new Error('Course not found');
}

    // Delete the document from the database
    await Course.findByIdAndDelete(courseId);
// Delete associated image file if it exists
    if (course.imageUrl) {
        deleteFile(course.imageUrl);
}

    // Optional: Delete associated module resource files
    if (course.modules && course.modules.length > 0) {
        course.modules.forEach(module => {
            if (module.resources && module.resources.length > 0) {
                module.resources.forEach(resourceUrl => {
                    // Assuming resourceUrl is a path like '/uploads/module-res-...'
       
// Check if it's a local file path before deleting
                    if (resourceUrl.startsWith('/uploads/')) {
                        deleteFile(resourceUrl);
                    }
            
});
            }
        });
}

    return { message: 'Course deleted successfully' };
};
// --- END ADD ---


// --- Module Quiz Functions (Unchanged) ---
exports.getModuleQuizQuestions = async (courseId, moduleId) => { /* ... */ };
exports.updateModuleQuiz = async (courseId, moduleId, questions) => { /* ... */ };
exports.submitModuleScore = async (courseId, moduleId, studentId, userAnswers) => { /* ... */ };