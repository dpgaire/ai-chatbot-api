const { QdrantClient } = require("@qdrant/js-client-rest");
const GeminiManager = require("./gemini.service");
const { generateId, normalizeId } = require("../utils/generateId");

class AboutService {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.collectionName = process.env.ABOUT_COLLECTION_NAME || "about";
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
            distance: "Cosine",
          },
        });
        console.log(`Collection '${this.collectionName}' created successfully`);
      } else {
        throw error;
      }
    }
  }

  async addAbout(aboutData) {
    await this.ensureCollection();

    const embedding = await this.geminiManager.generateEmbedding(
      aboutData.description
    );
    const id = generateId();

    const point = {
      id: id,
      vector: embedding,
      payload: aboutData,
    };

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [point],
    });

    return { success: true, id };
  }

  async getAbout() {
    await this.ensureCollection();

    const response = await this.client.scroll(this.collectionName, {
      limit: 100,
      with_payload: true,
    });

    return response.points.map((point) => ({ id: point.id, ...point.payload }));
  }

  async updateAbout(id, aboutData) {
    await this.ensureCollection();
    console.log("Updating About - ID:", id);
    console.log("Updating About - Data:", aboutData);

    const pointId = normalizeId(id);

    try {
      // First, check if the point exists
      const existingPoint = await this.client.retrieve(this.collectionName, {
        ids: [pointId],
      });

      if (existingPoint.length === 0) {
        throw new Error(`Point with id ${id} not found`);
      }

      const embedding = await this.geminiManager.generateEmbedding(
        aboutData.description
      );

      const point = {
        id: pointId,
        vector: embedding,
        payload: aboutData,
      };

      await this.client.upsert(this.collectionName, {
        wait: true,
        points: [point],
      });

      return { success: true, id: pointId };
    } catch (error) {
      console.error("Error updating point in Qdrant:", error);
      throw error;
    }
  }

  async deleteAbout(id) {
    await this.ensureCollection();
    try {
      // Convert ID to the correct type if needed
      const pointId = normalizeId(id);

      // Check if point exists first
      const existingPoints = await this.client.retrieve(this.collectionName, {
        ids: [pointId],
      });

      if (existingPoints.length === 0) {
        throw new Error(`Point with id ${id} not found`);
      }

      await this.client.delete(this.collectionName, {
        wait: true, // Add wait for confirmation
        points: [pointId],
      });

      return { success: true };
    } catch (error) {
      console.error("Error deleting point from Qdrant:", error);

      // More specific error handling
      if (error.status === 400) {
        throw new Error(`Invalid ID format or request: ${error.message}`);
      } else if (error.status === 404) {
        throw new Error(`Point not found: ${error.message}`);
      }

      throw error;
    }
  }
}

module.exports = new AboutService();
