const { QdrantClient } = require('@qdrant/js-client-rest');

class QdrantManager {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.collectionName = process.env.COLLECTION_NAME || 'personal_data';
  }

  async ensureCollection() {
    try {
      // Check if collection exists
      await this.client.getCollection(this.collectionName);
      console.log(`Collection '${this.collectionName}' already exists`);
    } catch (error) {
      if (error.status === 404) {
        // Collection doesn't exist, create it
        console.log(`Creating collection '${this.collectionName}'`);
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: 768, // Gemini embedding size
            distance: 'Cosine',
          },
        });
        console.log(`Collection '${this.collectionName}' created successfully`);
      } else {
        throw error;
      }
    }
  }

  async storeEmbedding(id, text, embedding) {
    await this.ensureCollection();
    
    const point = {
      id: id,
      vector: embedding,
      payload: {
        text: text,
        timestamp: new Date().toISOString(),
      },
    };

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [point],
    });

    return { success: true, id };
  }

  async searchSimilar(queryEmbedding, limit = 3) {
    await this.ensureCollection();
    
    const searchResult = await this.client.search(this.collectionName, {
      vector: queryEmbedding,
      limit: limit,
      with_payload: true,
    });

    return searchResult.map(result => ({
      id: result.id,
      score: result.score,
      text: result.payload.text,
      timestamp: result.payload.timestamp,
    }));
  }
}

module.exports = QdrantManager;
