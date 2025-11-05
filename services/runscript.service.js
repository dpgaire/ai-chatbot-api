const { QdrantClient } = require('@qdrant/js-client-rest');
const GeminiManager = require('./gemini.service');
const { generateId, normalizeId } = require("../utils/generateId");
const { exec } = require('child_process');

class RunScriptService {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.collectionName = process.env.RUNSCRIPT_COLLECTION_NAME || 'runscripts';
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

  async addScript(scriptData) {
    await this.ensureCollection();

    const embedding = await this.geminiManager.generateEmbedding(scriptData.script_name);
    const id = scriptData.id || generateId();

    const point = {
      id: id,
      vector: embedding,
      payload: scriptData,
    };

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [point],
    });

    return { success: true, id };
  }

  async getScripts() {
    await this.ensureCollection();

    const response = await this.client.scroll(this.collectionName, {
      limit: 100, // Adjust the limit as needed
      with_payload: true,
    });

    return response.points.map(point => ({ id: point.id, ...point.payload }));
  }

  async getScriptById(id) {
    await this.ensureCollection();
    const pointId = normalizeId(id);
    const response = await this.client.retrieve(this.collectionName, {
      ids: [pointId],
      with_payload: true,
    });
    if (response.length === 0) {
      throw new Error(`Script with id ${pointId} not found.`);
    }
    return { id: response[0].id, ...response[0].payload };
  }

  async updateScript(id, scriptData) {
    await this.ensureCollection();
    const pointId = normalizeId(id);

    try {
      const embedding = await this.geminiManager.generateEmbedding(scriptData.script_name);

      const point = {
        id: pointId,
        vector: embedding,
        payload: scriptData,
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

  async deleteScript(id) {
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

  async runScript(id) {
    const script = await this.getScriptById(id);
    const { script_path } = script;

    console.log('script_path',script_path)

    return new Promise((resolve, reject) => {
      exec(script_path, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return reject({ error, stderr, stdout });
        }
        resolve({ stdout, stderr });
      });
    });
  }
}

module.exports = new RunScriptService();
