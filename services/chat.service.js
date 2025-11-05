const QdrantManager = require('./qdrant.service');
const { generateId, normalizeId } = require('../utils/generateId');

class ChatService {
  constructor() {
    this.qdrantManager = new QdrantManager();
    this.usersCollectionName = 'chat_users';
    this.historyCollectionName = 'chat_history';
  }

  // ✅ Make sure both collections exist
  async ensureCollections() {
    await this.qdrantManager.ensureCollection(this.usersCollectionName);
    await this.qdrantManager.ensureCollection(this.historyCollectionName);
  }

  // ✅ Create / save new user
  async saveUser({ fullName, email }) {
    await this.ensureCollections();
    const userId = generateId();
    const user = { id: userId, payload: { fullName, email } };
    await this.qdrantManager.upsertPoint(this.usersCollectionName, [user]);
    return user;
  }

  // ✅ Save chat history for a user
  async saveChatHistory({ userId, fullName, email, title, messages }) {
    await this.ensureCollections();
    const chatId = generateId();
    const chatHistory = {
      id: chatId,
      payload: { userId, fullName, email, title, messages },
    };
    await this.qdrantManager.upsertPoint(this.historyCollectionName, [chatHistory]);
    return chatHistory;
  }

  // ✅ Get all users (admin)
  async getUsers() {
    await this.ensureCollections();
    const response = await this.qdrantManager.scrollPoints(this.usersCollectionName);
    return response.map(point => ({ id: point.id, ...point.payload }));
  }

  // ✅ Get chat histories (admin or user)
  async getChatHistories(userId, role) {
    await this.ensureCollections();
    let queryOptions = {
      with_payload: true,
    };

    // Restrict for non-admin
    if (role !== 'superAdmin') {
      queryOptions.filter = {
        must: [
          {
            key: 'userId',
            match: { value: userId },
          },
        ],
      };
    }

    const response = await this.qdrantManager.scrollPoints(this.historyCollectionName, queryOptions);
    return response.map(point => ({ id: point.id, ...point.payload }));
  }

  // ✅ Get chat history by userId and chatId
  async getChatHistoryByUserIdAndChatId(userId, chatId) {
    await this.ensureCollections();
    const chatHistory = await this.qdrantManager.getPoint(this.historyCollectionName, chatId);
    if (chatHistory && String(chatHistory.payload.userId) === String(userId)) {
      return { id: chatHistory.id, ...chatHistory.payload };
    }
    return null;
  }

  // ✅ Update chat history (only owner or admin)
  async updateChatHistory(id, chatData, userId, role) {
    await this.ensureCollections();
    const pointId = normalizeId(id);

    const existingPoint = await this.qdrantManager.getPoint(this.historyCollectionName, pointId);
    if (!existingPoint) throw new Error(`Chat with id ${id} not found`);

    const payload = existingPoint.payload;
    if (role !== 'superAdmin' && role !== 'Admin' && String(payload.userId) !== String(userId)) {
      throw new Error('Forbidden: You do not own this chat');
    }

    const updatedPayload = { ...payload, ...chatData };
    const point = { id: pointId, payload: updatedPayload };

    await this.qdrantManager.upsertPoint(this.historyCollectionName, [point]);
    return { success: true, id: pointId };
  }

  // ✅ Delete single chat (only owner or admin)
  async deleteChatHistory(id, userId, role) {
    await this.ensureCollections();
    const pointId = normalizeId(id);

    const chat = await this.qdrantManager.getPoint(this.historyCollectionName, pointId);
    if (!chat) throw new Error(`Chat with id ${id} not found`);

    if (role !== 'superAdmin'  && String(chat.payload.userId) !== String(userId)) {
      throw new Error('Forbidden: You do not own this chat');
    }

    await this.qdrantManager.deletePoints(this.historyCollectionName, [pointId]);
    return { success: true };
  }

  // ✅ Delete user and all their chats
  async deleteUser(userId) {
    await this.ensureCollections();
    const pointId = normalizeId(userId);

    try {
      // Delete user's chat histories
      const chats = await this.getChatHistories(pointId, 'superAdmin');
      for (const chat of chats) {
        await this.qdrantManager.deletePoints(this.historyCollectionName, [chat.id]);
      }

      // Delete user itself
      await this.qdrantManager.deletePoints(this.usersCollectionName, [pointId]);

      console.log(`User ${pointId} and all chats deleted successfully.`);
      return { success: true };
    } catch (error) {
      console.error(`Failed to delete user ${pointId}:`, error);
      throw error;
    }
  }
}

module.exports = new ChatService();
