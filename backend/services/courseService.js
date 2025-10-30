// backend/services/courseService.js
const Course = require('../models/courseModule');
const User = require('../models/userModel');
const fs = require('fs');
const path = require('path');

// Helper function to safely delete a file
const deleteFile = (filePath) => {
    if (!filePath) return; 
    const absolutePath = path.join(__dirname, '..', filePath); 
    fs.unlink(absolutePath, (err) => {
        if (err && err.code !== 'ENOENT') { 
            console.error(`Error deleting file ${absolutePath}:`, err);
        } else if (!err) {
             console.log(`Deleted file: ${absolutePath}`);
        }
    });
};

exports.createCourse = async (data) => {
  const course = new Course(data);
  return await course.save();
};

exports.getAllCourses = async () => {
  return await Course.find().sort({ createdAt: -1 });
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
    return await Course.findById(id); // Fallback
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

// --- UPDATE: updateCourse ---
exports.updateCourse = async (courseId, updateData) => {
    const course = await Course.findById(courseId);
    if (!course) {
        throw new Error('Course not found');
    }
    let oldImageUrl = course.imageUrl; 
    
    // Update fields from updateData
    if (updateData.title !== undefined) course.title = updateData.title;
    if (updateData.description !== undefined) course.description = updateData.description;
    if (updateData.imageUrl !== undefined) course.imageUrl = updateData.imageUrl;
    if (updateData.category !== undefined) course.category = updateData.category; // Add this line

    const updatedCourse = await course.save();
    
    if (updateData.imageUrl && oldImageUrl && updateData.imageUrl !== oldImageUrl) {
        deleteFile(oldImageUrl);
    }
    return await Course.findById(updatedCourse._id).populate('enrolledStudents', 'name email _id');
};
// --- END UPDATE ---

// --- DELETE COURSE SERVICE ---
exports.deleteCourse = async (courseId) => {
    const course = await Course.findByIdAndDelete(courseId);
    if (!course) {
        throw new Error('Course not found');
    }
    if (course.imageUrl) {
        deleteFile(course.imageUrl); 
    }
    if (course.modules && course.modules.length > 0) {
        course.modules.forEach(module => {
            if (module.resources && module.resources.length > 0) {
                module.resources.forEach(resourceUrl => {
                    if (resourceUrl.startsWith('/uploads/')) {
                        deleteFile(resourceUrl);
                    }
                });
            }
        });
    }
    return { message: 'Course deleted successfully' };
};
// --- END DELETE ---


// --- Module Quiz Functions (unchanged) ---
exports.getModuleQuizQuestions = async (courseId, moduleId) => { /* ... */ };
exports.updateModuleQuiz = async (courseId, moduleId, questions) => { /* ... */ };
exports.submitModuleScore = async (courseId, moduleId, studentId, userAnswers) => { /* ... */ };