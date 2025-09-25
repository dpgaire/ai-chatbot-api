const QdrantManager = require('../services/qdrant.service');

const getQueries = async (req, res) => {
  try {
    const qdrantManager = new QdrantManager();
    const queries = await qdrantManager.getUserQueries();

    return res.status(200).json({
      success: true,
      queries: queries,
    });

  } catch (error) {
    console.error('Get queries error:', error);
    
    return res.status(500).json({ 
      error: 'Internal server error while getting queries',
      details: error.message 
    });
  }
};

module.exports = {
  getQueries,
};
