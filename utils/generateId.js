// utils/idGenerator.js

// Generate a unique numeric ID using timestamp + random number
const generateId = () => {
  const timestamp = Date.now(); // always increasing integer
  const random = Math.floor(Math.random() * 1000); // 0–999
  return timestamp * 1000 + random; // combine to make it more unique
};

// Helper method to normalize ID format
const normalizeId = (id) => {
  // If your generateId creates numeric IDs as strings, convert them back to numbers
  if (typeof id === 'string' && !isNaN(id)) {
    return parseInt(id, 10);
  }
  return id;
};

module.exports = {
  generateId,
  normalizeId,
};
