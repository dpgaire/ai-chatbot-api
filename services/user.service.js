const { QdrantClient } = require("@qdrant/js-client-rest");
const bcrypt = require("bcryptjs");
const { generateId, normalizeId } = require("../utils/generateId");

class UserService {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.collectionName = "users";
  }

  async ensureCollection() {
    try {
      const collectionInfo = await this.client.getCollection(
        this.collectionName
      );
      console.log(`Collection '${this.collectionName}' already exists`);
    } catch (error) {
      if (error.status === 404) {
        console.log(`Creating collection '${this.collectionName}'`);
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: 4,
            distance: "Cosine",
          },
        });
        console.log(`Collection '${this.collectionName}' created successfully`);

        console.log(`Creating index on 'email' field`);
        await this.client.createPayloadIndex(this.collectionName, {
          field_name: "email",
          field_schema: "keyword",
          wait: true,
        });
        console.log(`Index on 'email' field created successfully`);
      } else {
        console.error(
          "Error checking/creating collection:",
          error.message,
          error.status,
          error.data
        );
        throw error;
      }
    }
  }

  async createUser(email, password, role) {
    await this.ensureCollection();

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateId();

    const point = {
      id: userId,
      vector: [0.1, 0.2, 0.3, 0.4],
      payload: { email, password: hashedPassword, role },
    };

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [point],
    });

    return { id: userId, email, role };
  }

  async getUsers(userId, role) {
    console.log("role", role);
    if (role !== "superAdmin") {
      throw new Error(
        "Forbidden: You do not have permission to access this resource"
      );
    }
    const response = await this.client.scroll(this.collectionName, {
      limit: 100,
      with_payload: true,
    });
    return response.points.map((point) => ({ id: point.id, ...point.payload }));
  }

  async getUserById(id, userId, role) {
    if (role !== "superAdmin" && id !== userId) {
      throw new Error(
        "Forbidden: You do not have permission to access this resource"
      );
    }
    const pointId = normalizeId(id);

    const response = await this.client.retrieve(this.collectionName, {
      ids: [pointId],
      with_payload: true,
    });
    if (response.length === 0) {
      return null;
    }
    return { id: response[0].id, ...response[0].payload };
  }

  async updateUser(id, updates, userId, role) {
    if (role !== "superAdmin" && id !== userId) {
      throw new Error(
        "Forbidden: You do not have permission to modify this resource"
      );
    }
    const pointId = normalizeId(id);
    const { email, password, role: newRole } = updates;
    const payload = {};
    if (email) payload.email = email;
    if (newRole) payload.role = newRole;
    if (password) {
      payload.password = await bcrypt.hash(password, 10);
    }

    await this.client.setPayload(this.collectionName, {
      payload,
      points: [pointId],
      wait: true,
    });

    return { id, ...updates };
  }

  async deleteUser(id, userId, role) {
    await this.ensureCollection(); // make sure collection + indices exist

    const pointId = normalizeId(id);

    try {
      const retrieveResponse = await this.client.retrieve(this.collectionName, {
        ids: [pointId],
        with_payload: true,
      });

      if (!retrieveResponse || retrieveResponse.length === 0) {
        throw new Error(`Point with id ${pointId} not found.`);
      }

      const payload = retrieveResponse[0].payload || {};

      // normalize types to avoid number/string mismatch
      if (
        role !== "superAdmin" &&
        String(payload.userId) !== String(userId)
      ) {
        throw new Error("Forbidden");
      }

      // Use the client's delete method (not deletePoints) — matches other places in your code
      await this.client.delete(this.collectionName, {
        points: [pointId],
        wait: true,
      });

      return { success: true, message: "User deleted successfully" };
    } catch (error) {
      console.error("Error deleting point in Qdrant:", error);
      throw error;
    }
  }
}

module.exports = new UserService();
