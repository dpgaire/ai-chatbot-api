const libraryService = require('../services/library.service');

const addLibrary = async (req, res) => {
  try {
    const library = await libraryService.addLibrary(req.body);
    res.status(201).json(library);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLibraries = async (req, res) => {
  try {
    const libraries = await libraryService.getLibraries();
    res.status(200).json(libraries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLibraryById = async (req, res) => {
  try {
    const library = await libraryService.getLibraryById(req.params.id);
    res.status(200).json(library);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateLibrary = async (req, res) => {
  try {
    const library = await libraryService.updateLibrary(req.params.id, req.body);
    res.status(200).json(library);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteLibrary = async (req, res) => {
  try {
    await libraryService.deleteLibrary(req.params.id);
    res.status(200).json({ message: 'Library deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addLibrary,
  getLibraries,
  getLibraryById,
  updateLibrary,
  deleteLibrary,
};
