const { QdrantClient } = require('@qdrant/js-client-rest');
const GeminiManager = require('./gemini.service');
const { generateId, normalizeId } = require("../utils/generateId");

class GoalsService {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.collectionName = process.env.GOALS_COLLECTION_NAME || 'goals';
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

  async addGoal(goalData, userId) {
    await this.ensureCollection();

    const embedding = await this.geminiManager.generateEmbedding(goalData.title);
    const id = goalData.id || generateId();

    const point = {
      id: id,
      vector: embedding,
      payload: { ...goalData, keyResults: [], userId },
    };

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [point],
    });

    return { success: true, id };
  }

  async getGoals(userId, role) {
    await this.ensureCollection();

    let queryOptions = {
      limit: 100,
      with_payload: true,
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

    const response = await this.client.scroll(this.collectionName, queryOptions);

    return response.points.map(point => ({ id: point.id, ...point.payload }));
  }

  async getGoalById(id) {
    await this.ensureCollection();
    const pointId = normalizeId(id);
    const response = await this.client.retrieve(this.collectionName, {
      ids: [pointId],
      with_payload: true,
    });
    if (response.length === 0) {
      throw new Error(`Goal with id ${pointId} not found.`);
    }
    return { id: response[0].id, ...response[0].payload };
  }

  async updateGoal(id, goalData, userId, role) {
    await this.ensureCollection();
    const pointId = normalizeId(id);

    try {
      const existingPoint = await this.client.retrieve(this.collectionName, {
        ids: [pointId],
        with_payload: true,
      });

      if (existingPoint.length === 0) {
        throw new Error(`Point with id ${id} not found`);
      }

      const existingPayload = existingPoint[0].payload;

      if (role !== 'superAdmin' && role !== 'Admin' && String(existingPayload.userId) !== String(userId)) {
        throw new Error("Forbidden: You do not own this record");
      }

      const embedding = await this.geminiManager.generateEmbedding(goalData.title);

      const updatedPayload = {
        ...existingPayload,
        ...goalData,
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

      return { success: true, id: pointId };
    } catch (error) {
      console.error('Error updating point in Qdrant:', error);
      throw error;
    }
  }

  async deleteGoal(id, userId, role) {
    await this.ensureCollection();
    try {
      const pointId = normalizeId(id);
      const retrieveResponse = await this.client.retrieve(this.collectionName, {
        ids: [pointId],
        with_payload: true,
      });

      if (retrieveResponse.length === 0) {
        throw new Error(`Point with id ${pointId} not found.`);
      }

      if (role !== 'superAdmin' && role !== 'Admin' && retrieveResponse[0].payload.userId !== userId) {
        throw new Error('Forbidden');
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

  async createKeyResult(goalId, keyResultData, userId, role) {
    const goal = await this.getGoalById(goalId);
    const keyResults = Array.isArray(keyResultData) ? keyResultData : [keyResultData];
    const newKeyResults = keyResults.map(kr => ({ ...kr, id: generateId() }));
    goal.keyResults.push(...newKeyResults);
    await this.updateGoal(goalId, { keyResults: goal.keyResults }, userId, role);
    return newKeyResults;
  }

  async updateKeyResult(goalId, krId, keyResultData, userId, role) {
    const goal = await this.getGoalById(goalId);
    const normalizedKrId = normalizeId(krId);
    const keyResultIndex = goal.keyResults.findIndex(kr => kr.id === normalizedKrId);
    if (keyResultIndex === -1) {
      throw new Error(`Key Result with id ${krId} not found.`);
    }

    let dataToUpdate = keyResultData;
    if (Array.isArray(keyResultData)) {
      dataToUpdate = keyResultData[0];
    }

    goal.keyResults[keyResultIndex] = { ...goal.keyResults[keyResultIndex], ...dataToUpdate };
    await this.updateGoal(goalId, { keyResults: goal.keyResults }, userId, role);
    return goal.keyResults[keyResultIndex];
  }

  async deleteKeyResult(goalId, krId, userId, role) {
    const goal = await this.getGoalById(goalId);
    const normalizedKrId = normalizeId(krId);
    goal.keyResults = goal.keyResults.filter(kr => kr.id !== normalizedKrId);
    await this.updateGoal(goalId, { keyResults: goal.keyResults }, userId, role);
    return { success: true };
  }
}

module.exports = new GoalsService();
