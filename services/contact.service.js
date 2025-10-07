const { QdrantClient } = require("@qdrant/js-client-rest");
const GeminiManager = require("./gemini.service");
const { generateId } = require("../utils/generateId");

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

  async addContact(contactData) {
    await this.ensureCollection();

    const embedding = await this.geminiManager.generateEmbedding(
      contactData.message
    );
    const id = generateId();

    const point = {
      id: id,
      vector: embedding,
      payload: contactData,
    };

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [point],
    });

    return { success: true, id };
  }
  async getContact() {
    await this.ensureCollection();

    const response = await this.client.scroll(this.collectionName, {
      limit: 100, // Adjust the limit as needed
      with_payload: true,
    });

    return response.points.map((point) => point.payload);
  }
}

module.exports = new ContactService();
