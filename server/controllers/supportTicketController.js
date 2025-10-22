// server/controllers/supportTicketController.js
const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const Admin = require('../models/Admin');
const sendEmail = require('../utils/sendEmail');
const { transformTicketUrls } = require('../utils/fileHelper');
const path = require('path');

/**
 * Helper to get relative path for DB storage.
 */
const getRelativePath = (fullPath) => {
    // ... (keep existing helper function)
    if (!fullPath) return null;
    const uploadsIndex = fullPath.indexOf('uploads');
    if (uploadsIndex === -1) {
        return fullPath.replace(/\\/g, '/');
    }
    return fullPath.substring(uploadsIndex).replace(/\\/g, '/');
};


// @desc    Create a new support ticket
// ... (createTicketForUser function remains the same) ...
exports.createTicketForUser = async (req, res) => {
    // ... (existing code)
    const { category, subject, description, priority } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const newTicket = new SupportTicket({
            user: req.user.id,
            category,
            subject,
            description: description,
            priority,
            attachments: req.files ? req.files.map(file => ({
                fileName: file.originalname,
                filePath: getRelativePath(file.path),
                fileType: file.mimetype
            })) : []
        });
        const ticket = await newTicket.save();

        // Email logic...
        await sendEmail({ /* ... user email ... */ });
        const admins = await Admin.find().select('email');
        const adminEmails = admins.map(admin => admin.email);
        if (adminEmails.length > 0) {
            await sendEmail({ /* ... admin email ... */ });
        }

        let ticketData = ticket.toObject();
        ticketData = transformTicketUrls(ticketData);
        res.status(201).json(ticketData);
    } catch (err) {
        console.error('Error in createTicketForUser:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all support tickets
// ... (getUserTickets function remains the same) ...
exports.getUserTickets = async (req, res) => {
    // ... (existing code)
    const { sortBy, search } = req.query;
    try {
        const query = { user: req.user.id };
        if (search) {
            query.ticketNumber = { $regex: search, $options: 'i' };
        }
        let sortOptions = {};
        if (sortBy === 'oldest') {
            sortOptions.updatedAt = 1;
        } else {
            sortOptions.updatedAt = -1;
        }
        const tickets = await SupportTicket.find(query)
            .sort(sortOptions)
            .select('-replies') // Keep excluding replies for list view efficiency
            .lean();
        res.json(tickets);
    } catch (err) {
        console.error('Error in getUserTickets:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get a single ticket by ID
// @route   GET /api/support/:id
// @access  Private
exports.getTicketById = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id)
            .populate('user', 'firstName lastName email')
            // --- THIS IS THE FIX ---
            // Populate the 'category' field and select only the 'name'
            .populate('category', 'name')
            .lean(); // Keep .lean()

        if (!ticket) {
            return res.status(404).json({ msg: 'Ticket not found' });
        }

        // --- Security check remains the same ---
        // Ensure user ID from token matches the ticket's user ID
        // Note: When using .lean(), the user object is plain JS,
        // so accessing ticket.user._id works directly.
        if (!ticket.user || ticket.user._id.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // --- URL transformation remains the same ---
        const transformedTicket = transformTicketUrls(ticket);

        res.json(transformedTicket);

    } catch (err) {
        console.error('Error in getTicketById:', err.message);
        if (err.kind === 'ObjectId') {
             return res.status(404).json({ msg: 'Ticket not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Add a reply to a ticket
// ... (addReply function remains the same) ...
exports.addReply = async (req, res) => {
    // ... (existing code)
     const { replyMessage } = req.body;
    if (!replyMessage && (!req.files || req.files.length === 0)) {
        return res.status(400).json({ msg: 'Reply message or attachment is required' });
    }
    try {
        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ msg: 'Ticket not found' });
        if (ticket.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        const newReply = {
            user: req.user.id,
            message: replyMessage || '',
            attachments: req.files ? req.files.map(file => ({
                fileName: file.originalname,
                filePath: getRelativePath(file.path),
                fileType: file.mimetype
            })) : [],
            repliedBy: 'User'
        };

        ticket.replies.push(newReply);
        ticket.status = 'Pending';
        ticket.updatedAt = Date.now();
        await ticket.save();

        // Re-fetch to populate correctly AFTER saving the reply
        let updatedTicket = await SupportTicket.findById(ticket._id)
            .populate('user', 'firstName lastName email')
            // --- ADD POPULATE HERE TOO for consistency when replying ---
            .populate('category', 'name')
            .lean();

        const transformedTicket = transformTicketUrls(updatedTicket);
        res.json(transformedTicket);
    } catch (err) {
        console.error('Error in addReply:', err.message);
        res.status(500).send('Server Error');
    }
};