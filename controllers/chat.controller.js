const GeminiManager = require('../services/gemini.service');
const QdrantManager = require('../services/qdrant.service');
const chatService = require('../services/chat.service');

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

    // Store the user query
    await qdrantManager.storeUserQuery(query, queryEmbedding);

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
      // context: {
      //   documentsFound: similarDocs.length,
      //   relevantDocs: similarDocs.map(doc => ({
      //     id: doc.id,
      //     relevanceScore: Math.round(doc.score * 100) / 100,
      //     textPreview: doc.text.substring(0, 150) + (doc.text.length > 150 ? '...' : ''),
      //     timestamp: doc.timestamp
      //   }))
      // },
      // metadata: {
      //   queryLength: query.length,
      //   embeddingSize: queryEmbedding.length,
      //   responseLength: response.length
      // }
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error during chat',
      details: error.message 
    });
  }
};

const saveUser = async (req, res) => {
  try {
    const { fullName, email } = req.body;
    if (!fullName) {
      return res.status(400).json({ error: 'Missing required fields: fullName and email' });
    }
    const user = await chatService.saveUser({ fullName, email });
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error',error });
  }
};

const saveChatHistory = async (req, res) => {
  try {
    const { userId, title, messages } = req.body;
    if (!userId || !title || !messages) {
      return res.status(400).json({ error: 'Missing required fields: userId, title, and messages' });
    }
    const chatHistory = await chatService.saveChatHistory({ userId, title, messages });
    res.status(201).json({ success: true, chatHistory });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await chatService.getUsers();
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getChatHistories = async (req, res) => {
  try {
    const chatHistories = await chatService.getChatHistories();
    res.status(200).json({ success: true, chatHistories });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'Missing required field: userId' });
    }
    const chatHistory = await chatService.getChatHistoryByUserId(parseInt(userId));
    res.status(200).json({ success: true, chatHistory });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getChatHistoryById = async (req, res) => {
  try {
    const { userId, chatId } = req.params;
    if (!userId || !chatId) {
      return res.status(400).json({ error: 'Missing required fields: userId and chatId' });
    }
    const chatHistory = await chatService.getChatHistoryByUserIdAndChatId(parseInt(userId), parseInt(chatId));
    if (chatHistory) {
      res.status(200).json({ success: true, chatHistory });
    } else {
      res.status(404).json({ success: false, message: 'Chat history not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateChatHistory = async (req, res) => {
  try {
    const { userId, chatId } = req.params;
    const { title } = req.body;
    if (!userId || !chatId || !title) {
      return res.status(400).json({ error: 'Missing required fields: userId, chatId, and title' });
    }
    const chatHistory = await chatService.updateChatHistoryTitle(parseInt(userId), parseInt(chatId), title);
    if (chatHistory) {
      res.status(200).json({ success: true, chatHistory });
    } else {
      res.status(404).json({ success: false, message: 'Chat history not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteChatHistory = async (req, res) => {
  try {
    const { userId, chatId } = req.params;
    if (!userId || !chatId) {
      return res.status(400).json({ error: 'Missing required fields: userId and chatId' });
    }
    const success = await chatService.deleteChatHistory(parseInt(userId), parseInt(chatId));
    if (success) {
      res.status(200).json({ success: true, message: 'Chat history deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Chat history not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  chat,
  saveUser,
  saveChatHistory,
  getUsers,
  getChatHistories,
  getChatHistory,
  getChatHistoryById,
  updateChatHistory,
  deleteChatHistory,
};
