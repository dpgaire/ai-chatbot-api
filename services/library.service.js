const { QdrantClient } = require('@qdrant/js-client-rest');
const GeminiManager = require('./gemini.service');
const { generateId, normalizeId } = require("../utils/generateId");

class LibraryService {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.collectionName = process.env.LIBRARY_COLLECTION_NAME || 'library';
    this.geminiManager = new GeminiManager();
  }

  async ensureCollection() {
    try {
      await this.client.getCollection(this.collectionName);
      console.log(`Collection '${this.collectionName}' already exists`);
    } catch (error) {
      if (error.status === 404) {
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

  async addLibrary(libraryData) {
    await this.ensureCollection();

    const embedding = await this.geminiManager.generateEmbedding(libraryData.title);
    const id = libraryData.id || generateId();

    const point = {
      id: id,
      vector: embedding,
      payload: libraryData,
    };

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [point],
    });

    return { success: true, id };
  }

  async getLibraries() {
    await this.ensureCollection();

    const response = await this.client.scroll(this.collectionName, {
      limit: 100, // Adjust the limit as needed
      with_payload: true,
    });

    return response.points.map(point => ({ id: point.id, ...point.payload }));
  }

  async getLibraryById(id) {
    await this.ensureCollection();
    const pointId = normalizeId(id);
    const response = await this.client.retrieve(this.collectionName, {
      ids: [pointId],
      with_payload: true,
    });
    if (response.length === 0) {
      throw new Error(`Library with id ${pointId} not found.`);
    }
    return { id: response[0].id, ...response[0].payload };
  }

  async updateLibrary(id, libraryData) {
    await this.ensureCollection();
    const pointId = normalizeId(id);

    try {
      const embedding = await this.geminiManager.generateEmbedding(libraryData.title);

      const point = {
        id: pointId,
        vector: embedding,
        payload: libraryData,
      };

      await this.client.upsert(this.collectionName, {
        wait: true,
        points: [point],
      });

      return { success: true, id: pointId };
    } catch (error) {
      console.error('Error updating point in Qdrant:', error);
      throw error;
    }
  }

  async deleteLibrary(id) {
    await this.ensureCollection();
    try {
      const pointId = normalizeId(id);
      const retrieveResponse = await this.client.retrieve(this.collectionName, {
        ids: [pointId],
        with_payload: false,
      });

      if (retrieveResponse.length === 0) {
        throw new Error(`Point with id ${pointId} not found.`);
      }

      await this.client.delete(this.collectionName, {
        points: [pointId],
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting point from Qdrant:', error);
      throw error;
    }
  }
}

module.exports = new LibraryService();
