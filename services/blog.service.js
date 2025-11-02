const { QdrantClient } = require('@qdrant/js-client-rest');
const GeminiManager = require('./gemini.service');
const { generateId, normalizeId } = require("../utils/generateId");


class BlogService {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.collectionName = process.env.BLOG_COLLECTION_NAME || 'blogs';
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

  async addBlog(blogData, userId) {
    await this.ensureCollection();

    const embedding = await this.geminiManager.generateEmbedding(blogData.content);
    const id = blogData.id || generateId();

    const point = {
      id: id,
      vector: embedding,
      payload: { ...blogData, views: [], userId },
    };

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [point],
    });

    return { success: true, id };
  }

  async getBlogs(userId, role) {
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

    return response.points.map(point => ({ id: point.id, ...point.payload }));
  }

  async updateBlog(id, blogData, userId, role) {
    await this.ensureCollection();
    console.log('Updating Blog - ID:', id);
    console.log('Updating Blog - Data:', blogData);

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

      const embedding = await this.geminiManager.generateEmbedding(blogData.content);

      const point = {
        id: pointId,
        vector: embedding,
        payload: blogData,
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

  async deleteBlog(id, userId, role) {
    await this.ensureCollection();
    try {
        const pointId = normalizeId(id);
      const retrieveResponse = await this.client.retrieve(this.collectionName, {
        ids: [pointId],
        with_payload: true,
      });
      console.log('Qdrant Retrieve Response for delete:', retrieveResponse);

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
      console.error('Error deleting point from Qdrant:', error); // Log the full error object
      throw error;
    }
  }

  async getBlogById(id) {
    await this.ensureCollection();
    const pointId = normalizeId(id);
    const response = await this.client.retrieve(this.collectionName, {
      ids: [pointId],
      with_payload: true,
    });
    if (response.length === 0) {
      throw new Error(`Blog with id ${pointId} not found.`);
    }
    return { id: response[0].id, ...response[0].payload };
  }

  async incrementViewCount(id) {
    await this.ensureCollection();
    const pointId = normalizeId(id);

    const blog = await this.getBlogById(pointId);
    const views = blog.views || [];
    views.push({ timestamp: new Date() });

    const updatedBlog = { ...blog, views };

    await this.updateBlog(pointId, updatedBlog);

    return { success: true, title: blog.title, views, viewCount: views.length };
  }
}

module.exports = new BlogService();
