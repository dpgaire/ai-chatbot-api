const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');

router.post('/blogs', blogController.addBlog);
router.get('/blogs', blogController.getBlogs);

module.exports = router;
