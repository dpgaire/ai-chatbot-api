const { QdrantClient } = require("@qdrant/js-client-rest");
const GeminiManager = require("./gemini.service");
const { generateId, normalizeId } = require("../utils/generateId");

class ContactService {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.collectionName = process.env.CONTACT_COLLECTION_NAME || "contact";
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

  async addContact(contactData, userId) {
    await this.ensureCollection();

    const embedding = await this.geminiManager.generateEmbedding(
      contactData.message
    );
    const id = contactData.id || generateId();

    const point = {
      id: id,
      vector: embedding,
      payload: { ...contactData, userId },
    };

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [point],
    });

    return { success: true, id };
  }
  async getContact(userId, role) {
    await this.ensureCollection();

    let filter = {};
    if (role !== 'superAdmin' && role !== 'Admin') {
      filter = {
        must: [
          {
            key: "userId",
            match: { value: userId },
          },
        ],
      };
    }

    const response = await this.client.scroll(this.collectionName, {
      filter,
      limit: 100, // Adjust the limit as needed
      with_payload: true,
    });
    return response.points.map((point) => ({ id: point.id, ...point.payload }));
  }

  async getContactById(id) {
    await this.ensureCollection();
    const pointId = normalizeId(id);
    const response = await this.client.retrieve(this.collectionName, {
      ids: [pointId],
      with_payload: true,
    });
    if (response.length === 0) {
      throw new Error(`Contact with id ${pointId} not found.`);
    }
    return { id: response[0].id, ...response[0].payload };
  }

  async updateContact(id, contactData, userId, role) {
    await this.ensureCollection();
    const pointId = normalizeId(id);

    try {
      const existingPoint = await this.client.retrieve(this.collectionName, {
        ids: [pointId],
      });

      if (existingPoint.length === 0) {
        throw new Error(`Point with id ${id} not found`);
      }

      if (role !== 'superAdmin' && role !== 'Admin' && existingPoint[0].payload.userId !== userId) {
        throw new Error('Forbidden');
      }

      const embedding = await this.geminiManager.generateEmbedding(
        contactData.message
      );

      const point = {
        id: pointId,
        vector: embedding,
        payload: contactData,
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

  async deleteContact(id, userId, role) {
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
      console.error("Error deleting point from Qdrant:", error);
      throw error;
    }
  }
}

module.exports = new ContactService();
