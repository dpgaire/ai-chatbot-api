const { QdrantClient } = require("@qdrant/js-client-rest");
const { generateId, normalizeId } = require("../utils/generateId");

class ChatService {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.usersCollectionName = "chat_users";
    this.historyCollectionName = "chat_history";
  }

  async ensureCollections() {
    await this.ensureCollection(this.usersCollectionName, 768);
    await this.ensureCollection(this.historyCollectionName, 768, "userId");
  }

  async ensureCollection(collectionName, vectorSize, indexField = null) {
    try {
      await this.client.getCollection(collectionName);
      console.log(`Collection '${collectionName}' already exists`);
    } catch (error) {
      if (error.status === 404) {
        await this.client.createCollection(collectionName, {
          vectors: {
            size: vectorSize,
            distance: "Cosine",
          },
        });
        console.log(`Collection '${collectionName}' created successfully`);
      }
    }

    if (indexField) {
      try {
        await this.client.createPayloadIndex(collectionName, {
          field_name: indexField,
          field_schema: "keyword",
        });
        console.log(`Index for '${indexField}' ensured on '${collectionName}'`);
      } catch (indexError) {
        if (indexError.message?.includes("already exists")) {
          console.log(`Index for '${indexField}' already exists`);
        } else {
          console.error(`Error ensuring index for ${indexField}:`, indexError);
        }
      }
    }
  }

  async saveUser({ fullName, email }) {
    await this.ensureCollections();
    const userId = generateId();
    const user = { id: userId, payload: { fullName, email } };
    await this.client.upsert(this.usersCollectionName, { wait: true, points: [user] });
    return user;
  }

  async saveChatHistory({ userId, title, messages }) {
    await this.ensureCollections();
    const chatId = generateId();
    const chatHistory = { id: chatId, payload: { userId, title, messages } };
    await this.client.upsert(this.historyCollectionName, { wait: true, points: [chatHistory] });
    return chatHistory;
  }

  async getUsers() {
    await this.ensureCollections();
    const response = await this.client.scroll(this.usersCollectionName, { with_payload: true });
    return response.points.map(point => ({ id: point.id, ...point.payload }));
  }

  async getChatHistories(userId, role) {
    await this.ensureCollections();
    let queryOptions = {
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

    const response = await this.client.scroll(this.historyCollectionName, queryOptions);
    return response.points.map(point => ({ id: point.id, ...point.payload }));
  }

  async getChatHistoryByUserIdAndChatId(userId, chatId) {
    await this.ensureCollections();
    const chatHistory = await this.client.retrieve(this.historyCollectionName, { ids: [chatId], with_payload: true });
    if (chatHistory.length > 0 && chatHistory[0].payload.userId === userId) {
      return { id: chatHistory[0].id, ...chatHistory[0].payload };
    }
    return null;
  }

  async updateChatHistory(id, chatData, userId, role) {
    await this.ensureCollections();
    const pointId = normalizeId(id);

    const existingPoint = await this.client.retrieve(this.historyCollectionName, {
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

    const updatedPayload = {
      ...existingPayload,
      ...chatData,
    };

    const point = {
      id: pointId,
      payload: updatedPayload,
    };

    await this.client.upsert(this.historyCollectionName, {
      wait: true,
      points: [point],
    });

    return { success: true, id: pointId };
  }

  async deleteChatHistory(id, userId, role) {
    await this.ensureCollections();
    const pointId = normalizeId(id);

    const existingPoint = await this.client.retrieve(this.historyCollectionName, {
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

    await this.client.delete(this.historyCollectionName, {
      points: [pointId],
    });

    return { success: true };
  }

  async deleteUser(userId) {
    await this.ensureCollections();
    const pointId = normalizeId(userId);
    try {
      const userChatHistories = await this.getChatHistories(pointId, 'superAdmin');
      
      for (const chat of userChatHistories) {
        try {
          await this.client.delete(this.historyCollectionName, { points: [chat.id] });
        } catch (chatError) {
          console.error(`Failed to delete chat with id ${chat.id}:`, chatError);
        }
      }

      await this.client.delete(this.usersCollectionName, { points: [pointId] });

      console.log(`User ${pointId} and their chats deleted successfully.`);
      return true;
    } catch (error) {
      console.error(`Failed to delete user ${pointId}:`, error);
      return false;
    }
  }
}

module.exports = new ChatService();
