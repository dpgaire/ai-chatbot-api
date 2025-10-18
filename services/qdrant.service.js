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
      const collectionExists = await this.client
        .getCollection(collectionName)
        .catch(() => null);
      if (collectionExists) {
        console.log(`Collection '${collectionName}' already exists`);
        return;
      }

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

  async ensureCollectionWithoutVector(collectionName) {
    try {
      const collectionExists = await this.client
        .getCollection(collectionName)
        .catch(() => null);
      if (collectionExists) {
        console.log(`Collection '${collectionName}' already exists`);
        return;
      }

      console.log(`Creating collection '${collectionName}'`);
      await this.client.createCollection(collectionName, {
        vectors: {
          size: 1,
          distance: "Cosine",
        },
      });
      console.log(`Collection '${collectionName}' created successfully`);
    } catch (error) {
      console.error(`Error ensuring collection '${collectionName}':`, error);
      throw error;
    }
  }

  async upsertPoint(collectionName, points) {
    await this.ensureCollectionWithoutVector(collectionName);
    const pointsWithVectors = points.map(point => ({
      ...point,
      vector: [0],
    }));
    await this.client.upsert(collectionName, {
      wait: true,
      points: pointsWithVectors,
    });
  }

  async scrollPoints(collectionName, limit = 100) {
    await this.ensureCollectionWithoutVector(collectionName);
    const scrollResult = await this.client.scroll(collectionName, {
      with_payload: true,
      with_vectors: false,
      limit: limit,
    });
    return scrollResult.points.map((point) => ({ id: point.id, ...point.payload }));
  }

  async getPoint(collectionName, pointId) {
    await this.ensureCollectionWithoutVector(collectionName);
    const result = await this.client.retrieve(collectionName, {
      ids: [pointId],
      with_payload: true,
    });
    return result[0];
  }

  async deletePoint(collectionName, pointId) {
    await this.ensureCollectionWithoutVector(collectionName);
    await this.client.delete(collectionName, {
      points: [pointId],
    });
    return { success: true, id: pointId };
  }

  async updatePayload(collectionName, pointId, payload) {
    await this.ensureCollectionWithoutVector(collectionName);
    await this.client.setPayload(collectionName, {
      payload: payload,
      points: [pointId],
    });
  }

  async storeEmbedding(id, payload, embedding) {
    await this.ensureCollection(this.collectionName);

    const point = {
      id: id,
      vector: embedding,
      payload: {
        ...payload,
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
      payload: result.payload,
    }));
  }

  async getUserQueries() {
    await this.ensureCollection(this.userQueriesCollectionName);

    const scrollResult = await this.client.scroll(
      this.userQueriesCollectionName,
      {
        with_payload: true,
        with_vectors: false,
        limit: 100, 
      }
    );

    return scrollResult.points.map((point) => ({
      id: point.id,
      query: point.payload.query,
      timestamp: point.payload.timestamp,
    }));
  }

  async getAllTrainData() {
    await this.ensureCollection(this.collectionName);

    const scrollResult = await this.client.scroll(this.collectionName, {
      with_payload: true,
      with_vectors: false,
      limit: 100, // Adjust limit as needed
    });

    return scrollResult.points.map((point) => ({ id: point.id, ...point.payload }));
  }

  async deleteTrainData(id) {
    await this.ensureCollection(this.collectionName);

    await this.client.delete(this.collectionName, {
      points: [id],
    });

    return { success: true, id };
  }

  async getTrainDataPoint(id) {
    await this.ensureCollection(this.collectionName);

    const result = await this.client.retrieve(this.collectionName, {
      ids: [id],
      with_payload: true,
    });

    return result[0];
  }
}

module.exports = QdrantManager;
