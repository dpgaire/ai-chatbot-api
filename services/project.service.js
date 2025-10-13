const { QdrantClient } = require('@qdrant/js-client-rest');
const GeminiManager = require('./gemini.service');
const { generateId, normalizeId } = require("../utils/generateId");


class ProjectService {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.collectionName = process.env.PROJECT_COLLECTION_NAME || 'projects';
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

  async addProject(projectData) {
    await this.ensureCollection();

    const embedding = await this.geminiManager.generateEmbedding(projectData.longDescription);
    const id = projectData.id || generateId();

    const point = {
      id: id,
      vector: embedding,
      payload: { ...projectData, views: [] },
    };

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [point],
    });

    return { success: true, id };
  }

  async getProjects() {
    await this.ensureCollection();

    const response = await this.client.scroll(this.collectionName, {
      limit: 100, // Adjust the limit as needed
      with_payload: true,
    });

    return response.points.map(point => ({ id: point.id, ...point.payload }));
  }

  async updateProject(id, projectData) {
    await this.ensureCollection();
    console.log('Updating Project - ID:', id);
    console.log('Updating Project - Data:', projectData);

    const pointId = normalizeId(id);


    try {
      const embedding = await this.geminiManager.generateEmbedding(projectData.longDescription);

      const point = {
        id: pointId,
        vector: embedding,
        payload: projectData,
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

  async deleteProject(id) {
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
        wait: true,
        points: [pointId],
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting point from Qdrant:', error); // Log the full error object
      throw error;
    }
  }

  async getProjectById(id) {
    await this.ensureCollection();
    const pointId = normalizeId(id);
    const response = await this.client.retrieve(this.collectionName, {
      ids: [pointId],
      with_payload: true,
    });
    if (response.length === 0) {
      throw new Error(`Project with id ${pointId} not found.`);
    }
    return { id: response[0].id, ...response[0].payload };
  }

  async incrementViewCount(id) {
    await this.ensureCollection();
    const pointId = normalizeId(id);

    const project = await this.getProjectById(pointId);
    const views = project.views || [];
    views.push({ timestamp: new Date() });

    const updatedProject = { ...project, views };

    await this.updateProject(pointId, updatedProject);

    return { success: true, title: project.title, views };
  }
}

module.exports = new ProjectService();
