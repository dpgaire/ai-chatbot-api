const generateUniqueId = require('../utils/generateId');
const GeminiManager = require('../services/gemini.service');
const QdrantManager = require('../services/qdrant.service');

const train = async (req, res) => {
  try {
    // Validate environment variables
    if (!process.env.GEMINI_API_KEY || !process.env.QDRANT_URL) {
      return res.status(500).json({ 
        error: 'Missing required environment variables' 
      });
    }

    // Validate request body
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        error: 'Missing required fields: text' 
      });
    }

    if (typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Text must be a non-empty string' 
      });
    }

    // Initialize clients
    const qdrantManager = new QdrantManager();
    const geminiManager = new GeminiManager();

    // Generate embedding
    console.log(`Generating embedding for text: ${text.substring(0, 100)}...`);
    const embedding = await geminiManager.generateEmbedding(text);

    // Store in Qdrant
    const id = generateUniqueId();
    console.log('id',id)
    console.log(`Storing embedding with ID: ${id}`);
    const result = await qdrantManager.storeEmbedding(id, text, embedding);

    return res.status(200).json({
      success: true,
      message: 'Text successfully trained and stored',
      id: result.id,
      textLength: text.length,
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

module.exports = {
  train,
};