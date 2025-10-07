const { QdrantClient } = require('@qdrant/js-client-rest');
const GeminiManager = require('./gemini.service');
const { generateId, normalizeId } = require("../utils/generateId");
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

    return response.points.map(point => ({ id: point.id, ...point.payload }));
  }

  async updateSkill(id, skillData) {
    await this.ensureCollection();
    console.log('Updating Skill - ID:', id);
    console.log('Updating Skill - Data:', skillData);
    const pointId = normalizeId(id);

    try {
      const skillsText = skillData.skills.map(s => s.name).join(', ');
      const textToEmbed = `${skillData.title}: ${skillsText}`;
      const embedding = await this.geminiManager.generateEmbedding(textToEmbed);

      const point = {
        id: pointId,
        vector: embedding,
        payload: skillData,
      };

      await this.client.upsert(this.collectionName, {
        wait: true,
        points: [point],
      });

      return { success: true, id: pointId };
    } catch (error) {
      console.error('Error updating point in Qdrant:', error); // Log the full error object
      throw error;
    }
  }

  async deleteSkill(id) {
    await this.ensureCollection();
    try {
      const pointId = normalizeId(id);

      const retrieveResponse = await this.client.retrieve(this.collectionName, {
        ids: [pointId],
        with_payload: false,
      });
      console.log('Qdrant Retrieve Response for delete:', retrieveResponse);

      if (retrieveResponse.length === 0) {
        throw new Error(`Point with id ${pointId} not found.`);
      }

      await this.client.delete(this.collectionName, {
        points: [pointId],
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting point from Qdrant:', error); // Log the full error object
      throw error;
    }
  }
}

module.exports = new SkillService();
