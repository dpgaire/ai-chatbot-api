const generateUniqueId = () => {
  const timestamp = Date.now();
  const randomNumber = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomNumber}`;
};

module.exports = generateUniqueId;
