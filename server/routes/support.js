// server/routes/support.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Your standard user authentication
const { upload } = require('../controllers/publicSupportTicketController'); // We can reuse the upload logic

// --- FIX: Import all required controller functions ---
const {
    createTicketForUser,
    getUserTickets,
    getTicketById,
    addReply
} = require('../controllers/supportTicketController');

// This is the new, secure route for creating a ticket.
// It uses the auth middleware to ensure only logged-in users can access it.
router.post('/', auth, upload.array('attachments', 5), createTicketForUser);

// --- FIX: Add routes for getting and replying to tickets ---

// @route   GET /api/support
// @desc    Get all tickets for the logged-in user
// @access  Private
router.get('/', auth, getUserTickets);

// @route   GET /api/support/:id
// @desc    Get a single ticket by ID
// @access  Private
router.get('/:id', auth, getTicketById);

// @route   POST /api/support/reply/:id
// @desc    Add a reply to a ticket
// @access  Private
router.post('/reply/:id', auth, upload.array('attachments', 5), addReply);

module.exports = router;