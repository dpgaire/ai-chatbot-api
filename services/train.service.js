const { QdrantClient } = require('@qdrant/js-client-rest');
const GeminiManager = require('./gemini.service');
const { generateId, normalizeId } = require("../utils/generateId");

class TrainService {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.collectionName = process.env.COLLECTION_NAME || 'personal_data';
    this.geminiManager = new GeminiManager();
  }

  async ensureCollection() {
    try {
      const collectionExists = await this.client.getCollection(this.collectionName).catch(() => null);
      if (collectionExists) {
        return;
      }
      await this.client.createCollection(this.collectionName, {
        vectors: {
          size: 768,
          distance: 'Cosine',
        },
      });
    } catch (error) {
      console.error(`Error ensuring collection '${this.collectionName}':`, error);
      throw error;
    }
  }

  async train(data) {
    const { category, title, content, tags } = data;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      throw new Error('Content must be a non-empty string');
    }

    const embedding = await this.geminiManager.generateEmbedding(content);
    const id = data.id || generateId();

    const point = {
      id: id,
      vector: embedding,
      payload: {
        category,
        title,
        content,
        tags,
        timestamp: new Date().toISOString(),
      },
    };

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [point],
    });

    return { id, contentLength: content.length, embeddingSize: embedding.length };
  }

  async getAllTrainData() {
    await this.ensureCollection();

    const scrollResult = await this.client.scroll(this.collectionName, {
      with_payload: true,
      with_vectors: false,
      limit: 100, // Adjust limit as needed
    });

    return scrollResult.points.map((point) => ({ id: point.id, ...point.payload }));
  }

  async updateTrainData(id, data) {
    await this.ensureCollection();
    const pointId = normalizeId(id);
    const { category, title, content, tags } = data;

    const existingPoint = await this.getPoint(pointId);
    if (!existingPoint) {
      throw new Error('Data point not found');
    }

    let embedding = existingPoint.vector;
    if (content && content !== existingPoint.payload.content) {
      embedding = await this.geminiManager.generateEmbedding(content);
    }

    const payload = {
      category: category ?? existingPoint.payload.category,
      title: title ?? existingPoint.payload.title,
      content: content ?? existingPoint.payload.content,
      tags: tags ?? existingPoint.payload.tags,
    };

    const point = {
      id: pointId,
      vector: embedding,
      payload,
    };

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [point],
    });

    return { id: pointId };
  }

  async deleteTrainData(id) {
    await this.ensureCollection();
    const pointId = normalizeId(id);

    const existingPoint = await this.getPoint(pointId);
    if (!existingPoint) {
      throw new Error('Data point not found');
    }

    await this.client.delete(this.collectionName, {
      points: [pointId],
    });
  }

  async getPoint(id) {
    await this.ensureCollection();
    const result = await this.client.retrieve(this.collectionName, {
      ids: [id],
      with_payload: true,
      with_vector: true,
    });
    return result[0];
  }
}

module.exports = new TrainService();
