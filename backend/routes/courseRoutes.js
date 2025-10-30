// backend/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const multer = require('multer');
const path = require('path');

// --- Multer Config ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const prefix = file.fieldname === 'courseImage' ? 'course-' : 'module-res-';
        cb(null, prefix + uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'courseImage') {
        if (file.mimetype.startsWith('image/')) { cb(null, true); }
        else { cb(new Error('Invalid file type for course image. Only images allowed.'), false); }
    } else if (file.fieldname === 'resources') {
        if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('video/')) { cb(null, true); }
        else { cb(new Error('Invalid file type for module resource. Only PDF or Video files allowed.'), false); }
    } else { cb(null, false); }
};
const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });
// --- End Multer Config ---

// --- Routes ---
router.get('/', courseController.getAllCourses);
router.get('/:id', auth, courseController.getCourseById);
router.post('/', auth, authorize(['admin']), upload.single('courseImage'), courseController.createCourse);
router.put('/:id', auth, authorize(['admin', 'instructor']), upload.single('courseImage'), courseController.updateCourse);

// --- DELETE Course Route (Admin only) ---
router.delete('/:id', auth, authorize(['admin']), courseController.deleteCourse);

router.put('/:id/enroll', auth, authorize(['admin', 'instructor']), courseController.enrollStudent);
router.post('/:id/modules', auth, authorize(['admin', 'instructor']), upload.array('resources'), courseController.addModule);

// --- Module Quiz Routes ---
router.get('/:courseId/modules/:moduleId/quiz', auth, authorize(['student']), courseController.getModuleQuiz);
router.put('/:courseId/modules/:moduleId/quiz', auth, authorize(['admin', 'instructor']), courseController.updateModuleQuiz);
router.post('/:courseId/modules/:moduleId/quiz/submit', auth, authorize(['student']), courseController.submitModuleScore);

module.exports = router;