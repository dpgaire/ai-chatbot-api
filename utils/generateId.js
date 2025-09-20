const generateUniqueId = () => {
  const timestamp = Date.now(); // always increasing integer
  const random = Math.floor(Math.random() * 1000); // 0–999
  return timestamp * 1000 + random; // combine to make it more unique
};

module.exports = generateUniqueId;
