const trainService = require('../services/train.service');

const train = async (req, res) => {
  try {
    const result = await trainService.train(req.body);
    return res.status(200).json({
      success: true,
      message: 'Data successfully trained and stored',
      ...result,
    });
  } catch (error) {
    console.error('Training error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during training',
      details: error.message 
    });
  }
};

const getAllTrainData = async (req, res) => {
  try {
    const data = await trainService.getAllTrainData();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Get all train data error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const updateTrainData = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await trainService.updateTrainData(id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Training data successfully updated',
      id: result.id,
    });
  } catch (error) {
    console.error('Error updating training data:', error);
    if (error.message === 'Data point not found') {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
};


const deleteTrainData = async (req, res) => {
  try {
    const { id } = req.params;
    await trainService.deleteTrainData(id);
    return res.status(200).json({ success: true, message: 'Data successfully deleted' });
  } catch (error) {
    console.error('Delete train data error:', error);
    if (error.message === 'Data point not found') {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  train,
  getAllTrainData,
  updateTrainData,
  deleteTrainData,
};