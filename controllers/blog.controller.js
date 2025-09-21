const blogService = require('../services/blog.service');

const addBlog = async (req, res) => {
  try {
    const blog = await blogService.addBlog(req.body);
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBlogs = async (req, res) => {
  try {
    const blogs = await blogService.getBlogs();
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addBlog,
  getBlogs,
};
