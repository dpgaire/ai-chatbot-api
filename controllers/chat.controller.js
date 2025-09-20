const GeminiManager = require('../services/gemini.service');
const QdrantManager = require('../services/qdrant.service');

const chat = async (req, res) => {
  try {
    // Validate environment variables
    if (!process.env.GEMINI_API_KEY || !process.env.QDRANT_URL) {
      return res.status(500).json({ 
        error: 'Missing required environment variables' 
      });
    }

    // Validate request body
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Missing required field: query' 
      });
    }

    if (typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Query must be a non-empty string' 
      });
    }

    // Initialize clients
    const qdrantManager = new QdrantManager();
    const geminiManager = new GeminiManager();

    // Generate embedding for the query
    console.log(`Generating embedding for query: ${query}`);
    const queryEmbedding = await geminiManager.generateEmbedding(query);

    // Search for similar documents in Qdrant
    console.log('Searching for similar documents...');
    const similarDocs = await qdrantManager.searchSimilar(queryEmbedding, 3);

    // Generate response using Gemini with context
    console.log(`Found ${similarDocs.length} similar documents, generating response...`);
    const response = await geminiManager.generateResponse(query, similarDocs);

    return res.status(200).json({
      success: true,
      query: query,
      response: response,
      context: {
        documentsFound: similarDocs.length,
        relevantDocs: similarDocs.map(doc => ({
          id: doc.id,
          relevanceScore: Math.round(doc.score * 100) / 100,
          textPreview: doc.text.substring(0, 150) + (doc.text.length > 150 ? '...' : ''),
          timestamp: doc.timestamp
        }))
      },
      metadata: {
        queryLength: query.length,
        embeddingSize: queryEmbedding.length,
        responseLength: response.length
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error during chat',
      details: error.message 
    });
  }
};

module.exports = {
  chat,
};
