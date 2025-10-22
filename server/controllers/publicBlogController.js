// server/controllers/publicBlogController.js
const Blog = require('../models/Blog'); // Assuming your model is named 'Blog'
const BlogCategory = require('../models/BlogCategory'); // Assuming your model is 'BlogCategory'
const { transformTicketUrls } = require('../utils/fileHelper'); // We can reuse this!

/**
 * Re-purposed helper to build the full URL for thumbnails.
 * It's generic enough to work for any object with a 'filePath' or 'thumbnail' property.
 */
const getFullUrl = (item) => {
    if (!item) return item;

    // 1. Determine the base URL
    const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`;

    // 2. Check for thumbnail and transform it
    // Handle both Mongoose docs (_doc) and plain objects (lean())
    const itemObj = item._doc || item;
    
    if (itemObj.thumbnail) {
        return {
            ...itemObj,
            thumbnail: `${baseUrl}/${itemObj.thumbnail.replace(/\\/g, '/')}`
        };
    }
    
    // Fallback for other file types if needed (like attachments in getBlogById)
    if (itemObj.attachments) {
         return transformTicketUrls(itemObj); // Use the existing helper
    }

    return itemObj;
};


// @desc    Get all public blogs with filters
// @route   GET /api/public/blogs
// @access  Public
exports.getPublicBlogs = async (req, res) => {
    const { category, search } = req.query;
    try {
        const query = { isPublished: true };

        if (category) {
            query.category = category;
        }
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const blogs = await Blog.find(query)
            .populate('category', 'name')
            .sort({ blogDate: -1 })
            .lean(); // Use .lean() to get plain objects

        // --- FIX: Transform thumbnail URLs ---
        const transformedBlogs = blogs.map(getFullUrl);

        res.json(transformedBlogs);
    } catch (err) {
        console.error('Error in getPublicBlogs:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get a single public blog by ID
// @route   GET /api/public/blogs/:id
// @access  Public
exports.getPublicBlogById = async (req, res) => {
    try {
        const blog = await Blog.findOne({ _id: req.params.id, isPublished: true })
            .populate('category', 'name')
            .lean();

        if (!blog) {
            return res.status(404).json({ msg: 'Blog not found' });
        }

        // --- FIX: Transform thumbnail URL ---
        const transformedBlog = getFullUrl(blog);

        res.json(transformedBlog);
    } catch (err) {
        console.error('Error in getPublicBlogById:', err.message);
        if (err.kind === 'ObjectId') {
             return res.status(404).json({ msg: 'Blog not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Get all public blog categories
// @route   GET /api/public/blogs/categories
// @access  Public
exports.getPublicBlogCategories = async (req, res) => {
    try {
        const categories = await BlogCategory.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        console.error('Error in getPublicBlogCategories:', err.message);
        res.status(500).send('Server Error');
    }
};