// server/controllers/publicSupportTicketController.js
const SupportTicket = require('../models/SupportTicket');
const SupportTicketCategory = require('../models/SupportTicketCategory');
const Admin = require('../models/Admin');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- FIX 1: Add the helper function to get the relative path ---
/**
 * Takes a full server path (e.g., /var/data/uploads/tickets/file.pdf)
 * and returns the relative path to be stored in the DB (e.g., uploads/tickets/file.pdf).
 */
const getRelativePath = (fullPath) => {
    if (!fullPath) return null;
    // Find the 'uploads' directory in the path and take everything from there
    const uploadsIndex = fullPath.indexOf('uploads');
    if (uploadsIndex === -1) {
        return fullPath.replace(/\\/g, '/');
    }
    return fullPath.substring(uploadsIndex).replace(/\\/g, '/');
};


// --- FIX 2: Update the multer storage destination ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // This is the absolute path to your persistent disk on Render
    const dir = '/var/data/uploads/tickets'; 
    
    // This fs check is great, keep it. It ensures the directory exists.
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});



const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('File type not allowed!'), false);
};


// This export is used by your other routes/controllers
exports.upload = multer({ storage, fileFilter, limits: { fileSize: 1024 * 1024 * 5 } });


// Note: These functions might be for a different route, but we fix them anyway.
exports.createTicket = async (req, res) => {
  const { category, subject, description, priority } = req.body;
  try {
    const newTicket = new SupportTicket({
      user: req.user.id,
      category,
      subject,
      description,
      priority,
      // --- FIX 3: Use getRelativePath to save the correct path ---
      attachments: req.files.map(file => ({
        fileName: file.originalname,
        filePath: getRelativePath(file.path), // Use helper here
        fileType: file.mimetype
      }))
    });
    const savedTicket = await newTicket.save();

    // ... (Email notifications) ...
    const user = await User.findById(req.user.id);
    const admins = await Admin.find().select('email');
    const adminEmails = admins.map(admin => admin.email);
    await sendEmail({ /* ... user email ... */ });
    if(adminEmails.length > 0) {
        await sendEmail({ /* ... admin email ... */ });
    }

    res.status(201).json(savedTicket);
  } catch (err) {
    console.error('Error creating ticket:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};


// ... (getUserTickets requires no changes) ...
exports.getUserTickets = async (req, res) => {
    // ... (existing code)
    try {
        const { sortBy = 'newest', search = '' } = req.query;
        const query = { user: req.user.id };
        if (search) {
            query.ticketNumber = parseInt(search, 10);
        }
        const sortOption = sortBy === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
        const tickets = await SupportTicket.find(query).sort(sortOption).populate('category', 'name');
        res.json(tickets);
    } catch (err) {
        console.error('Error fetching user tickets:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// ... (getTicketByIdForUser requires no changes, ASSUMING you add the transformUrl helper) ...
// For consistency, you should also apply the transformTicketUrls helper here.
exports.getTicketByIdForUser = async (req, res) => {
    // ... (existing code)
    // const { transformTicketUrls } = require('../utils/fileHelper'); // You would import this
    try {
        const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user.id })
            .populate('category', 'name')
            .populate('conversation.sender')
            .lean(); // Use .lean() to make it a plain object
            
        if (!ticket) {
            return res.status(404).json({ msg: 'Ticket not found' });
        }
        
        // const transformedTicket = transformTicketUrls(ticket); // Apply the same transform
        // res.json(transformedTicket);
        res.json(ticket); // Sticking to minimal change for now
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.addUserReply = async (req, res) => {
  const { message } = req.body;
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user.id });
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    const reply = {
      sender: req.user.id,
      senderType: 'User',
      message,
      // --- FIX 4: Use getRelativePath to save the correct path ---
      attachments: req.files ? req.files.map(file => ({
        fileName: file.originalname,
        filePath: getRelativePath(file.path), // Use helper here
        fileType: file.mimetype
      })) : []
    };
    ticket.conversation.push(reply);
    ticket.status = 'Open'; 
    const savedTicket = await ticket.save();

    // ... (Email notifications) ...
    const user = await User.findById(req.user.id);
    const admins = await Admin.find().select('email');
    const adminEmails = admins.map(admin => admin.email);
    if(adminEmails.length > 0) {
        await sendEmail({ /* ... admin email ... */ });
    }

    res.json(savedTicket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// ... (getSupportCategories requires no changes) ...
exports.getSupportCategories = async (req, res) => {
    // ... (existing code)
    try {
        const categories = await SupportTicketCategory.find();
        res.json(categories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};