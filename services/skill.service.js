const { QdrantClient } = require('@qdrant/js-client-rest');
const GeminiManager = require('./gemini.service');
const generateId = require('../utils/generateId');

class SkillService {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.collectionName = process.env.SKILL_COLLECTION_NAME || 'skills';
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

  async addSkill(skillData) {
    await this.ensureCollection();

    const skillsText = skillData.skills.map(s => s.name).join(', ');
    const textToEmbed = `${skillData.title}: ${skillsText}`;
    const embedding = await this.geminiManager.generateEmbedding(textToEmbed);
    const id = generateId();

    const point = {
      id: id,
      vector: embedding,
      payload: skillData,
    };

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [point],
    });

    return { success: true, id };
  }

  async getSkills() {
    await this.ensureCollection();

    const response = await this.client.scroll(this.collectionName, {
      limit: 100, // Adjust the limit as needed
      with_payload: true,
    });

    return response.points.map(point => point.payload);
  }
}

module.exports = new SkillService();
