const { QdrantClient } = require("@qdrant/js-client-rest");
const GeminiManager = require("./gemini.service");
const { generateId, normalizeId } = require("../utils/generateId");

class CodeLogService {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.collectionName = process.env.CODE_LOG_COLLECTION_NAME || "code_logs";
    this.geminiManager = new GeminiManager();
  }

  async ensureCollection() {
    try {
      await this.client.getCollection(this.collectionName);
      console.log(`Collection '${this.collectionName}' already exists`);
    } catch (error) {
      if (error.status === 404) {
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: 768, // Gemini embedding size
            distance: "Cosine",
          },
        });
      } else {
        throw error;
      }
    }
    try {
      await this.client.createPayloadIndex(this.collectionName, {
        field_name: "userId",
        field_schema: "integer", // or "keyword" if userId is stored as string
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

  async addCodeLog(codeLogData, userId) {
    await this.ensureCollection();

    const embedding = await this.geminiManager.generateEmbedding(
      codeLogData.code
    );
    const id = codeLogData.id || generateId();

    const point = {
      id: id,
      vector: embedding,
      payload: { ...codeLogData, userId },
    };

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [point],
    });

    return { success: true, id };
  }

  async getCodeLogs(userId, role) {
    await this.ensureCollection();

    let queryOptions = {
      limit: 100,
      with_payload: true,
    };

    // Only filter for non-admin users
    if (role !== "superAdmin" && role !== "Admin") {
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
      const response = await this.client.scroll(
        this.collectionName,
        queryOptions
      );
      return response.points.map((point) => ({
        id: point.id,
        ...point.payload,
      }));
    } catch (err) {
      console.error("Scroll error:", err);
      throw err; // rethrow so you can see full message in your logs
    }
  }

  async getCodeLogById(id) {
    await this.ensureCollection();
    const pointId = normalizeId(id);
    const response = await this.client.retrieve(this.collectionName, {
      ids: [pointId],
      with_payload: true,
    });
    if (response.length === 0) {
      throw new Error(`CodeLog with id ${pointId} not found.`);
    }
    return { id: response[0].id, ...response[0].payload };
  }

  async updateCodeLog(id, codeLogData, userId, role) {
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

      // ✅ Role-based permission check
      if (
        role !== "superAdmin" &&
        role !== "Admin" &&
        String(existingPayload.userId) !== String(userId)
      ) {
        throw new Error("Forbidden: You do not own this record");
      }

      // ✅ Regenerate embedding if code changed
      const embedding = await this.geminiManager.generateEmbedding(
        codeLogData.code
      );

      // ✅ Preserve old payload fields (like userId)
      const updatedPayload = {
        ...existingPayload,
        ...codeLogData,
        userId: existingPayload.userId || userId, // make sure it's not lost
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
      console.error("Error updating point in Qdrant:", error);
      throw error;
    }
  }

  async deleteCodeLog(id, userId, role) {
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

      if (
        role !== "superAdmin" &&
        role !== "Admin" &&
        retrieveResponse[0].payload.userId !== userId
      ) {
        throw new Error("Forbidden");
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

module.exports = new CodeLogService();
