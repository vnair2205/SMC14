// server/middleware/adminAuth.js
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        console.log('[Auth Middleware] No token provided.'); // Added log
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    console.log('[Auth Middleware] Token received:', token.substring(0, 10) + '...'); // Added log

    // --- Log the secret being used ---
    const secret = process.env.JWT_ADMIN_SECRET;
    if (!secret) {
        console.error('[Auth Middleware] FATAL: JWT_ADMIN_SECRET is undefined in this environment!');
        return res.status(500).json({ msg: 'Server configuration error: Missing admin secret' });
    }
    console.log('[Auth Middleware] Using secret ending in:', '...' + secret.slice(-4)); // Log last 4 chars for confirmation
    // --- End logging secret ---

    try {
        console.log('[Auth Middleware] Attempting to verify token...'); // Added log
        const decoded = jwt.verify(token, secret); // Use the variable 'secret'
        console.log('[Auth Middleware] Token verification successful. Decoded payload:', decoded); // Log the entire decoded object

        // --- Keep the check from before ---
        if (!decoded || !decoded.admin || !decoded.admin.id) {
            console.error('[Auth Middleware] Invalid token payload structure detected AFTER verification.'); // Updated log
            return res.status(401).json({ msg: 'Token payload is invalid' });
        }
        // --- End check ---

        console.log('[Auth Middleware] Payload valid. Admin ID:', decoded.admin.id); // Added log
        req.user = decoded.admin;

        next();
    } catch (err) {
        console.error('[Auth Middleware] Token verification failed with error:', err.message); // Log the specific JWT error
        // Optionally log the full error stack
        // console.error(err);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};