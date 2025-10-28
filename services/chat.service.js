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

const saveChatHistory = async ({ userId, title, messages }) => {
  const chatId = generateId();
  const chatHistory = { id: chatId, payload: { userId, title, messages } };
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
  return null;
};

const updateChatHistoryTitle = async (userId, chatId, title) => {
  const chatHistory = await getChatHistoryByUserIdAndChatId(userId, chatId);
  if (chatHistory) {
    const newPayload = { ...chatHistory.payload, title: title };
    await qdrantManager.updatePayload(CHAT_HISTORY_COLLECTION, chatId, newPayload);
    return { id: chatId, payload: newPayload };
  }
  return null;
};

const patchChatHistory = async (userId, chatId, patchData = {}) => {
  const chatHistory = await getChatHistoryByUserIdAndChatId(userId, chatId);
  if (!chatHistory) return null;

  // Custom merge logic for messages
  let mergedMessages = chatHistory.payload.messages || [];

  if (patchData.messages) {
    mergedMessages = [...mergedMessages, ...patchData.messages];
  }

  const newPayload = {
    ...chatHistory.payload,
    ...patchData,
    messages: mergedMessages, // ensure merged array is kept
    updatedAt: new Date().toISOString(),
  };

  await qdrantManager.updatePayload(CHAT_HISTORY_COLLECTION, chatId, newPayload);
  return { id: chatId, payload: newPayload };
};



const deleteChatHistory = async (userId, chatId) => {
  const chatHistory = await getChatHistoryByUserIdAndChatId(userId, chatId);
  if (chatHistory) {
    await qdrantManager.deletePoint(CHAT_HISTORY_COLLECTION, chatId);
    return true;
  }
  return false;
};

const deleteUser = async (userId) => {
   const pointId = normalizeId(userId);
  try {
    // Fetch user's chat history
    const userChatHistories = await getChatHistoryByUserId(pointId);
    
    // Delete each chat from Qdrant
    for (const chat of userChatHistories) {
      try {
        await qdrantManager.deletePoint(CHAT_HISTORY_COLLECTION, chat.id);
      } catch (chatError) {
        console.error(`Failed to delete chat with id ${chat.id}:`, chatError);
      }
    }

    // Delete the user from Qdrant
    await qdrantManager.deletePoint(CHAT_USERS_COLLECTION, pointId);

    console.log(`User ${pointId} and their chats deleted successfully.`);
    return true;
  } catch (error) {
    console.error(`Failed to delete user ${pointId}:`, error);
    return false;
  }
};

module.exports = {
  saveUser,
  saveChatHistory,
  getUsers,
  getChatHistories,
  getChatHistoryByUserId,
  getChatHistoryByUserIdAndChatId,
  updateChatHistoryTitle,
  patchChatHistory,
  deleteChatHistory,
  deleteUser,
};
