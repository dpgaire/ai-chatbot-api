const QdrantManager = require("../services/qdrant.service");
const { normalizeId } = require("../utils/generateId");

const getQueries = async (req, res) => {
  try {
    const qdrantManager = new QdrantManager();
    const queries = await qdrantManager.getUserQueries();

    return res.status(200).json({
      success: true,
      queries: queries,
    });
  } catch (error) {
    console.error("Get queries error:", error);

    return res.status(500).json({
      error: "Internal server error while getting queries",
      details: error.message,
    });
  }
};

const deleteQuery = async (req, res) => {
  try {
    const qdrantManager = new QdrantManager();
    const { id } = req.params;
    const pointId = normalizeId(id);
    await qdrantManager.deletePoint("user_queries", pointId);
    return res.status(200).json({
      success: true,
      message: `Query with id ${id} deleted successfully`,
    });
  } catch (error) {
    console.error("Delete query error:", error);

    return res.status(500).json({
      error: "Internal server error while deleting query",
      details: error.message,
    });
  }
};

module.exports = {
  getQueries,
  deleteQuery,
};
