// server/server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const http = require('http'); // Used for explicitly creating the server
// const { Server } = require("socket.io"); // This import is not used

// Import models needed for Socket.IO message handling
const Message = require('./models/Message');
const StudyGroup = require('./models/StudyGroup');
const User = require('./models/User');
const legalRoutes = require('./routes/legalRoutes');
const testUserRoutes = require('./routes/testUserRoutes');
const publicPreGenCourseRoutes = require('./routes/publicPreGenCourse');

const app = express();
const server = http.createServer(app); // Create an HTTP server instance

// Connect Database
connectDB();

// Init Middleware
app.use(cors()); // This is for standard API requests
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.set('trust proxy', 1); // Trust the first proxy (Render)

app.use((req, res, next) => {
    console.log(`[REQUEST LOG] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// --- Static Asset Serving ---

// 1. For file uploads (Correctly implemented from our previous fix)
app.use('/uploads', express.static('/var/data/uploads'));
// 2. For client 'public' folder (e.g., favicon, manifest)
app.use(express.static(path.join(__dirname, '../client/public')));

/*
// --- RECOMMENDATION: For PRODUCTION React App ---
// When you build your React app, you should serve the 'build' folder.
// Comment out the line above and uncomment these:

// 2. Serve the built React app
app.use(express.static(path.join(__dirname, '../client/build')));

// 3. Catch-all for client-side routing
// This must come AFTER all your API routes
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

*/

// --- API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/course', require('./routes/course'));
app.use('/api/studygroup', require('./routes/studyGroup'));
app.use('/api/message', require('./routes/message'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/pre-gen-category', require('./routes/preGenCategory'));
app.use('/api/public-pre-gen-courses', publicPreGenCourseRoutes); // Use the imported variable
app.use('/api/support', require('./routes/support'));

// FIX: This / root route will be overridden by the React catch-all ('*') in production.
// It's fine for API testing.
app.get('/', (req, res) => res.send('API Running'));

app.use('/api/knowledgebase/category', require('./routes/knowledgebaseCategory'));
app.use('/api/knowledgebase/article', require('./routes/knowledgebaseArticle'));
app.use('/api/public/kb', require('./routes/publicKnowledgebase')); // Renamed from public/knowledgebase for consistency
app.use('/api/blogs/category', require('./routes/blogCategory'));
app.use('/api/blogs/article', require('./routes/blog'));
app.use('/api/support/category', require('./routes/supportTicketCategory'));
app.use('/api/team/department', require('./routes/department'));
app.use('/api/team/designation', require('./routes/designation'));
app.use('/api/public/support', require('./routes/publicSupportTicket'));
app.use('/api/admin/support', require('./routes/adminSupport'));
app.use('/api/public/blogs', require('./routes/publicBlog'));
app.use('/api/legal', legalRoutes);
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/webhooks', require('./routes/webhookRoutes'));
app.use('/api/institute-plans', require('./routes/institutePlanRoutes'));
app.use('/api/institutes', require('./routes/instituteRoutes'));
app.use('/api/referrers', require('./routes/planReferrerRoutes')); // Simplified import
app.use('/api/test-users', testUserRoutes);
app.use('/api/pre-gen-course', require('./routes/preGenCourse'));

// --- FIX: Removed Duplicate Routes ---
// /api/dashboard (duplicate removed)
// /api/public-pre-gen-courses (duplicate removed)
// /api/public/knowledgebase (duplicate removed, assuming /api/public/kb is the correct one)


const PORT = process.env.PORT || 5000;

// --- Socket.IO Initialization ---
const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
        methods: ["GET", "POST"],
    },
});

io.on('connection', (socket) => {
    console.log('A user connected to Socket.IO');

    socket.on('setup', (userData) => {
        socket.join(userData.id);
        console.log(`User with ID ${userData.id} has set up their socket room.`);
        socket.emit('connected');
    });

    socket.on('join chat', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on('new message', async (newMessageData) => {
        let studyGroup = newMessageData.studyGroup;

        if (!studyGroup || !studyGroup.users) return console.log('Error: studyGroup.users not defined');

        try {
            var message = await Message.create({
                sender: newMessageData.sender._id,
                content: newMessageData.content,
                studyGroup: studyGroup._id,
            });

            message = await message.populate('sender', 'firstName lastName');
            message = await message.populate('studyGroup');
            message = await User.populate(message, {
                path: 'studyGroup.users',
                select: 'firstName lastName email',
            });

            await StudyGroup.findByIdAndUpdate(studyGroup._id, { latestMessage: message });

            // --- FIX: Optimized Emitter ---
            // Send the message to every user's personal room *except* the sender
            studyGroup.users.forEach((user) => {
                if (user._id.toString() === newMessageData.sender._id.toString()) {
                    return; // Don't send the message back to the sender
                }
                socket.in(user._id).emit('message received', message);
            });

        } catch (error) {
            console.error("Error handling new message:", error);
            // You could also emit an error back to the sender
            // socket.emit('message_error', { error: 'Could not send message' });
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));