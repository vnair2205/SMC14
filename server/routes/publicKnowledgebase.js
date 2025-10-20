// server/routes/publicKnowledgebase.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // User auth, not admin
const {
  getPublicCategories,
  getPublicArticles,
  getPublicArticleById,
    searchPublicArticles 
} = require('../controllers/publicKnowledgebaseController');

// All routes are protected by standard user authentication
router.use(auth);

router.get('/categories', getPublicCategories);
router.get('/articles', getPublicArticles);
router.get('/articles/:id', getPublicArticleById);

router.get('/search', searchPublicArticles);

module.exports = router;