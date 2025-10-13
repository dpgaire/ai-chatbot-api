const { QdrantClient } = require('@qdrant/js-client-rest');
const { generateId, normalizeId } = require("../utils/generateId");

class StatsService {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.collectionName = process.env.STATS_COLLECTION_NAME || 'stats';
    this.mainPageStatsId = normalizeId('main-page-views');
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
            size: 4, 
            distance: 'Cosine',
          },
        });
        console.log(`Collection '${this.collectionName}' created successfully`);
      } else {
        throw error;
      }
    }
  }

  async getMainPageViews() {
    await this.ensureCollection();

    try {
      const response = await this.client.retrieve(this.collectionName, {
        ids: [this.mainPageStatsId],
        with_payload: true,
      });

      if (response.length === 0) {
        return { views: [] };
      }

      return { views: response[0].payload.views || [] };
    } catch (error) {
      // If the point doesn't exist, return 0
      if (error.status === 404) {
        return { views: [] };
      }
      throw error;
    }
  }

  async incrementMainPageViews() {
    await this.ensureCollection();

    const currentStats = await this.getMainPageViews();
    const views = currentStats.views || [];
    views.push({ timestamp: new Date() });

    const point = {
      id: this.mainPageStatsId,
      vector: [0.1, 0.2, 0.3, 0.4], // Dummy vector
      payload: { views },
    };

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [point],
    });

    return { success: true, views };
  }
}

module.exports = new StatsService();