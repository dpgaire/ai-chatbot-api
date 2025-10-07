const { QdrantClient } = require("@qdrant/js-client-rest");
const { generateId } = require("../utils/generateId");

class QdrantManager {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.collectionName = process.env.COLLECTION_NAME || "personal_data";
    this.userQueriesCollectionName = "user_queries";
  }

  async ensureCollection(collectionName, vectorSize = 768) {
    try {
      // Check if collection exists
      const collectionExists = await this.client
        .getCollection(collectionName)
        .catch(() => null);
      if (collectionExists) {
        console.log(`Collection '${collectionName}' already exists`);
        return;
      }

      // Collection doesn't exist, create it
      console.log(`Creating collection '${collectionName}'`);
      await this.client.createCollection(collectionName, {
        vectors: {
          size: vectorSize,
          distance: "Cosine",
        },
      });
      console.log(`Collection '${collectionName}' created successfully`);
    } catch (error) {
      console.error(`Error ensuring collection '${collectionName}':`, error);
      throw error;
    }
  }

  async storeEmbedding(id, text, embedding) {
    await this.ensureCollection(this.collectionName);

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

  async storeUserQuery(query, queryEmbedding) {
    await this.ensureCollection(this.userQueriesCollectionName);
    const id = generateId();
    const point = {
      id: id,
      vector: queryEmbedding,
      payload: {
        query: query,
        timestamp: new Date().toISOString(),
      },
    };

    await this.client.upsert(this.userQueriesCollectionName, {
      wait: true,
      points: [point],
    });

    return { success: true, id };
  }

  async searchSimilar(queryEmbedding, limit = 3) {
    await this.ensureCollection(this.collectionName);

    const searchResult = await this.client.search(this.collectionName, {
      vector: queryEmbedding,
      limit: limit,
      with_payload: true,
    });

    return searchResult.map((result) => ({
      id: result.id,
      score: result.score,
      text: result.payload.text,
      timestamp: result.payload.timestamp,
    }));
  }

  async getUserQueries() {
    await this.ensureCollection(this.userQueriesCollectionName);

    const scrollResult = await this.client.scroll(
      this.userQueriesCollectionName,
      {
        with_payload: true,
        with_vectors: false,
        limit: 100, // Adjust limit as needed
      }
    );

    return scrollResult.points.map((point) => ({
      id: point.id,
      query: point.payload.query,
      timestamp: point.payload.timestamp,
    }));
  }
}

module.exports = QdrantManager;
