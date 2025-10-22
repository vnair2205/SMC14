// server/utils/fileHelper.js

/**
 * Transforms relative attachment paths in a ticket object to full, absolute URLs.
 * This works for both Mongoose objects (toObject()) and plain objects (lean()).
 */
exports.transformTicketUrls = (ticket) => {
    if (!ticket) return ticket;

    // 1. Determine the base URL
    // Render sets 'RENDER_EXTERNAL_URL'. For local, we use localhost.
    const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`;

    // Helper to map attachments
    const mapAttachments = (attachments = []) => {
        if (!attachments || attachments.length === 0) return [];
        return attachments.map(att => {
            // Handle both Mongoose docs (_doc) and plain objects (lean())
            const attObj = att._doc || att; 
            if (!attObj.filePath) return attObj; // Skip if no filePath

            return {
                ...attObj,
                // Create full URL and replace any backslashes (for Windows)
                filePath: `${baseUrl}/${attObj.filePath.replace(/\\/g, '/')}`
            };
        });
    };

    // 2. Transform top-level attachments
    if (ticket.attachments) {
        ticket.attachments = mapAttachments(ticket.attachments);
    }

    // 3. Transform attachments within replies
    if (ticket.replies && ticket.replies.length > 0) {
        ticket.replies = ticket.replies.map(reply => {
            const replyObj = reply._doc || reply;
            return {
                ...replyObj,
                attachments: mapAttachments(replyObj.attachments)
            };
        });
    }

    return ticket;
};