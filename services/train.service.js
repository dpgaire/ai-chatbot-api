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
      await this.client.getCollection(this.collectionName);
      console.log(`Collection '${this.collectionName}' already exists`);
    } catch (error) {
      if (error.status === 404) {
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: 768,
            distance: 'Cosine',
          },
        });
        console.log(`Collection '${this.collectionName}' created successfully`);
      }
    }
    try {
      await this.client.createPayloadIndex(this.collectionName, {
        field_name: "userId",
        field_schema: "integer",
      });
      console.log(`Index for 'userId' ensured on '${this.collectionName}'`);
    } catch (indexError) {
      if (indexError.message?.includes("already exists")) {
        console.log(`Index for 'userId' already exists`);
      } else {
        console.error("Error ensuring index for userId:", indexError);
      }
    }
  }

  async addTrainData(data, userId) {
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
        userId,
      },
    };

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [point],
    });

    return { id, contentLength: content.length, embeddingSize: embedding.length };
  }

  async getAllTrainData(userId, role) {
    await this.ensureCollection();

    let queryOptions = {
      with_payload: true,
      with_vectors: false,
      limit: 100, // Adjust limit as needed
    };

    if (role !== 'superAdmin' && role !== 'Admin') {
      queryOptions.filter = {
        must: [
          {
            key: "userId",
            match: { value: userId },
          },
        ],
      };
    }

    const scrollResult = await this.client.scroll(this.collectionName, queryOptions);

    return scrollResult.points.map((point) => ({ id: point.id, ...point.payload }));
  }

  async updateTrainData(id, data, userId, role) {
    await this.ensureCollection();
    const pointId = normalizeId(id);
    const { category, title, content, tags } = data;

    const existingPoint = await this.getPoint(pointId);
    if (!existingPoint) {
      throw new Error('Data point not found');
    }

    const existingPayload = existingPoint.payload;

    if (role !== 'superAdmin' && role !== 'Admin' && String(existingPayload.userId) !== String(userId)) {
      throw new Error("Forbidden: You do not own this record");
    }

    let embedding = existingPoint.vector;
    if (content && content !== existingPoint.payload.content) {
      embedding = await this.geminiManager.generateEmbedding(content);
    }

    const updatedPayload = {
      ...existingPayload,
      category: category ?? existingPoint.payload.category,
      title: title ?? existingPoint.payload.title,
      content: content ?? existingPoint.payload.content,
      tags: tags ?? existingPoint.payload.tags,
    };

    const point = {
      id: pointId,
      vector: embedding,
      payload: updatedPayload,
    };

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [point],
    });

    return { id: pointId };
  }

  async deleteTrainData(id, userId, role) {
    await this.ensureCollection();
    const pointId = normalizeId(id);

    const existingPoint = await this.getPoint(pointId);
    if (!existingPoint) {
      throw new Error('Data point not found');
    }

    const existingPayload = existingPoint.payload;

    if (role !== 'superAdmin' && role !== 'Admin' && String(existingPayload.userId) !== String(userId)) {
      throw new Error("Forbidden: You do not own this record");
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
