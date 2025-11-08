const { QdrantClient } = require("@qdrant/js-client-rest");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
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
    let collectionExists = true;
    try {
      await this.client.getCollection(this.collectionName);
    } catch (err) {
      if (err.status === 404) collectionExists = false;
      else throw err;
    }

    if (!collectionExists) {
      await this.client.createCollection(this.collectionName, {
        vectors: { size: 4, distance: "Cosine" },
      });

      await this.client.createPayloadIndex(this.collectionName, {
        field_name: "email",
        field_schema: "keyword",
        wait: true,
      });
    }
    await this._ensurePayloadIndex("apiKey");
    await this._ensurePayloadIndex("email");
  }

  async _ensurePayloadIndex(field) {
    try {
      await this.client.createPayloadIndex(this.collectionName, {
        field_name: field,
        field_schema: "keyword",
        wait: true,
      });
    } catch (err) {
      if (err.status !== 400) {
        console.error(`Failed to create index for "${field}":`, err);
        throw err;
      }
    }
  }

  generateApiKey() {
    return crypto.randomBytes(32).toString("hex");
  }

  async createUser(fullName, image, email, password, role) {
    await this.ensureCollection();

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateId();
    const apiKey = this.generateApiKey();

    const point = {
      id: userId,
      vector: [0.1, 0.2, 0.3, 0.4],
      payload: {
        fullName,
        image,
        email,
        password: hashedPassword,
        role,
        apiKey,
      },
    };

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [point],
    });

    return { id: userId, email, role, apiKey };
  }

  async findUserByApiKey(apiKey) {
    if (!apiKey) throw new Error("API key is required");
    const response = await this.client.scroll(this.collectionName, {
      filter: {
        must: [
          {
            key: "apiKey",
            match: { value: apiKey },
          },
        ],
      },
      limit: 1,
      with_payload: true,
    });

    if (!response.points?.length) {
      console.warn("No user found for API key:", apiKey);
      return null;
    }

    const user = response.points[0];
    const { password, ...safePayload } = user.payload;
    return { id: user.id, ...safePayload };
  }

  async getUsers(_userId, role) {
    if (role !== "superAdmin")
      throw new Error("Forbidden: only superAdmin can list users");

    const { points } = await this.client.scroll(this.collectionName, {
      limit: 200,
      with_payload: true,
    });
    return points.map((p) => ({ id: p.id, ...p.payload }));
  }

  async getUserById(id, userId, role) {
    const pointId = normalizeId(id);
    const [point] = await this.client.retrieve(this.collectionName, {
      ids: [pointId],
      with_payload: true,
    });
    const { password, ...safePayload } = point.payload;

    return point ? { id: point.id, ...safePayload } : null;
  }

  async updateUser(id, updates, userId, role) {
    if (role !== "superAdmin" && id !== userId) throw new Error("Forbidden");

    const pointId = normalizeId(id);
    const payload = {};

    if (updates.email) payload.email = updates.email;
    if (updates.role) payload.role = updates.role;
    if (updates.password)
      payload.password = await bcrypt.hash(updates.password, 10);

    await this.client.setPayload(this.collectionName, {
      payload,
      points: [pointId],
      wait: true,
    });

    return { id, ...updates };
  }

  async updateProfile(id, updates, userId) {
    if (String(id) !== String(userId)) throw new Error("Forbidden");

    const pointId = normalizeId(id);
    const payload = {};

    if (updates.fullName) payload.fullName = updates.fullName;
    if (updates.image) payload.image = updates.image;
    if (updates.email) payload.email = updates.email;
    if (updates.password)
      payload.password = await bcrypt.hash(updates.password, 10);
    if (updates.regenerateApiKey) payload.apiKey = this.generateApiKey();

    await this.client.setPayload(this.collectionName, {
      payload,
      points: [pointId],
      wait: true,
    });

    const { password, ...rest } = payload;
    return { id, ...rest };
  }

  async deleteUser(id, userId, role) {
    await this.ensureCollection();

    const pointId = normalizeId(id);
    const [point] = await this.client.retrieve(this.collectionName, {
      ids: [pointId],
      with_payload: true,
    });

    if (!point) throw new Error(`User ${pointId} not found`);

    if (
      role !== "superAdmin" &&
      String(point.payload.userId) !== String(userId)
    )
      throw new Error("Forbidden");

    await this.client.delete(this.collectionName, {
      points: [pointId],
      wait: true,
    });

    return { success: true, message: "User deleted" };
  }
}

/* Export a **singleton** – call ensureCollection() once at app start */
const userService = new UserService();

/* Initialise indexes **once** when the module is required */
userService.ensureCollection().catch((err) => {
  console.error("Failed to initialise Qdrant collection/indexes:", err);
});

module.exports = userService;
