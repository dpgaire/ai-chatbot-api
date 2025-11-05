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

  async addProject(projectData, userId) {
    await this.ensureCollection();

    const embedding = await this.geminiManager.generateEmbedding(projectData.longDescription);
    const id = projectData.id || generateId();

    const point = {
      id: id,
      vector: embedding,
      payload: { ...projectData, views: [], userId },
    };

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [point],
    });

    return { success: true, id };
  }

 async getProjects(userId, role) {
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

  try {
    const response = await this.client.scroll(this.collectionName, queryOptions);
    return response.points.map(point => ({ id: point.id, ...point.payload }));
  } catch (error) {
    console.error(`Error fetching projects for user ${userId}:`, error);
    throw new Error('Failed to fetch projects');
  }
}


  async updateProject(id, projectData, userId, role) {
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

      const embedding = await this.geminiManager.generateEmbedding(projectData.longDescription);

      const updatedPayload = {
        ...existingPayload,
        ...projectData,
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

  async deleteProject(id, userId, role) {
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
        wait: true,
        points: [pointId],
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting point from Qdrant:', error);
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

  async incrementViewCount(id, userId, role) {
    await this.ensureCollection();
    const pointId = normalizeId(id);

    const project = await this.getProjectById(pointId);
    const views = project.views || [];
    views.push({ timestamp: new Date() });

    await this.updateProject(pointId, { views }, userId, role);

    return { success: true, title: project.title, views };
  }
}

module.exports = new ProjectService();
