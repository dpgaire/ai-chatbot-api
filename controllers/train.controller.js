const generateUniqueId = require('../utils/generateId');
const GeminiManager = require('../services/gemini.service');
const QdrantManager = require('../services/qdrant.service');
const { generateId, normalizeId } = require("../utils/generateId");


const train = async (req, res) => {
  try {
    // Validate environment variables
    if (!process.env.GEMINI_API_KEY || !process.env.QDRANT_URL) {
      return res.status(500).json({ 
        error: 'Missing required environment variables' 
      });
    }

    // Validate request body
    const { category, title, content, tags } = req.body;
    
    if (!content) {
      return res.status(400).json({ 
        error: 'Missing required fields: content' 
      });
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Content must be a non-empty string' 
      });
    }

    // Initialize clients
    const qdrantManager = new QdrantManager();
    const geminiManager = new GeminiManager();

    // Generate embedding
    console.log(`Generating embedding for content: ${content.substring(0, 100)}...`);
    const embedding = await geminiManager.generateEmbedding(content);

    // Store in Qdrant
    const id = req.body.id || generateId();
    const payload = {
      category,
      title,
      content,
      tags,
    };
    console.log('id',id)
    console.log(`Storing embedding with ID: ${id}`);
    const result = await qdrantManager.storeEmbedding(id, payload, embedding);

    return res.status(200).json({
      success: true,
      message: 'Data successfully trained and stored',
      id: result.id,
      contentLength: content.length,
      embeddingSize: embedding.length
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
    const qdrantManager = new QdrantManager();
    const data = await qdrantManager.getAllTrainData();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Get all train data error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const updateTrainData = async (req, res) => {
  try {
    const { id } = req.params;
    const pointId = normalizeId(id);

    const { category, title, content, tags } = req.body;
    const qdrantManager = new QdrantManager();
    const geminiManager = new GeminiManager();

    const existingPoint = await qdrantManager.getPoint(pointId);
    if (!existingPoint) {
      return res.status(404).json({ error: 'Data point not found' });
    }

    let embedding = existingPoint.vector;
    if (content && content !== existingPoint.payload.content) {
      embedding = await geminiManager.generateEmbedding(content);
    }

    const payload = {
      category: category || existingPoint.payload.category,
      title: title || existingPoint.payload.title,
      content: content || existingPoint.payload.content,
      tags: tags || existingPoint.payload.tags,
    };

    const result = await qdrantManager.storeEmbedding(pointId, payload, embedding);
    return res.status(200).json({ success: true, message: 'Data successfully updated', id: result.id });
  } catch (error) {
    console.error('Update train data error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteTrainData = async (req, res) => {
  try {
    const { id } = req.params;
     const pointId = normalizeId(id);
    const qdrantManager = new QdrantManager();

    const existingPoint = await qdrantManager.getPoint(pointId);
    if (!existingPoint) {
      return res.status(404).json({ error: 'Data point not found' });
    }

    await qdrantManager.deleteTrainData(pointId);
    return res.status(200).json({ success: true, message: 'Data successfully deleted' });
  } catch (error) {
    console.error('Delete train data error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  train,
  getAllTrainData,
  updateTrainData,
  deleteTrainData,
};