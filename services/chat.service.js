const QdrantManager = require('./qdrant.service');
const { generateId, normalizeId } = require('../utils/generateId');

const qdrantManager = new QdrantManager();
const CHAT_USERS_COLLECTION = 'chat_users';
const CHAT_HISTORY_COLLECTION = 'chat_history';

const saveUser = async ({ fullName, email }) => {
  const userId = generateId();
  const user = { id: userId, payload: { fullName, email } };
  await qdrantManager.upsertPoint(CHAT_USERS_COLLECTION, [user]);
  return user;
};

const saveChatHistory = async ({ userId, email,fullName,title, messages }) => {
  const chatId = generateId();
  const chatHistory = { id: chatId, payload: { userId, email,fullName, title, messages } };
  await qdrantManager.upsertPoint(CHAT_HISTORY_COLLECTION, [chatHistory]);
  return chatHistory;
};

const getUsers = async () => {
  return await qdrantManager.scrollPoints(CHAT_USERS_COLLECTION);
};

const getChatHistories = async () => {
  return await qdrantManager.scrollPoints(CHAT_HISTORY_COLLECTION);
};

const getChatHistoryByUserId = async (userId) => {
  const allHistory = await qdrantManager.scrollPoints(CHAT_HISTORY_COLLECTION);
  return allHistory.filter(chat => chat.userId === userId);
};

const getChatHistoryByUserIdAndChatId = async (userId, chatId) => {
  const chatHistory = await qdrantManager.getPoint(CHAT_HISTORY_COLLECTION, chatId);
  if (chatHistory && chatHistory.payload.userId === userId) {
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
