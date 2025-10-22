const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Standard user authentication
const preGenCourseController = require('../controllers/preGenCourseController');

// All routes in this file are for logged-in users, so protect them all
router.use(auth);

// GET /api/public-pre-gen-courses/
// Fetches the list of all available pre-generated courses
router.get('/', preGenCourseController.getPreGenCourses); // Use getPreGenCourses

// GET /api/public-pre-gen-courses/category-counts
// Fetches the category list for the filter sidebar
router.get('/category-counts', preGenCourseController.getCategoryCounts);

// GET /api/public-pre-gen-courses/:id
// Fetches the details for a single pre-generated course
router.get('/:id', preGenCourseController.getPreGenCourseById);

// POST /api/public-pre-gen-courses/:id/start
// Creates a personal copy of the course for the user (enrolls them)
router.post('/:id/start', preGenCourseController.startCourse); // This now points to our corrected function

module.exports = router;