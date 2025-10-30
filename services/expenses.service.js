const { QdrantClient } = require('@qdrant/js-client-rest');
const GeminiManager = require('./gemini.service');
const { generateId, normalizeId } = require("../utils/generateId");

class ExpensesService {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.collectionName = process.env.EXPENSES_COLLECTION_NAME || 'expenses';
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

  async addExpense(expenseData) {
    await this.ensureCollection();

    const embedding = await this.geminiManager.generateEmbedding(expenseData.description);
    const id = expenseData.id || generateId();

    const point = {
      id: id,
      vector: embedding,
      payload: expenseData,
    };

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [point],
    });

    return { success: true, id };
  }

  async getExpenses() {
    await this.ensureCollection();

    const response = await this.client.scroll(this.collectionName, {
      limit: 100, // Adjust the limit as needed
      with_payload: true,
    });

    return response.points.map(point => ({ id: point.id, ...point.payload }));
  }

  async getExpenseById(id) {
    await this.ensureCollection();
    const pointId = normalizeId(id);
    const response = await this.client.retrieve(this.collectionName, {
      ids: [pointId],
      with_payload: true,
    });
    if (response.length === 0) {
      throw new Error(`Expense with id ${pointId} not found.`);
    }
    return { id: response[0].id, ...response[0].payload };
  }

  async updateExpense(id, expenseData) {
    await this.ensureCollection();
    const pointId = normalizeId(id);

    try {
      const embedding = await this.geminiManager.generateEmbedding(expenseData.description);

      const point = {
        id: pointId,
        vector: embedding,
        payload: expenseData,
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

  async deleteExpense(id) {
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

module.exports = new ExpensesService();
