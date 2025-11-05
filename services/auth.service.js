const { QdrantClient } = require('@qdrant/js-client-rest');
const bcrypt = require('bcryptjs');
const { generateId } = require("../utils/generateId");
class AuthService {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
    this.collectionName = 'users';
  }

  async ensureCollection() {
    try {
      const collectionInfo = await this.client.getCollection(this.collectionName);

      // Check if 'email' index exists
      const hasEmailIndex = collectionInfo.payload_schema?.email?.data_type === 'keyword';
      if (!hasEmailIndex) {
        await this.client.createPayloadIndex(this.collectionName, {
          field_name: 'email',
          field_schema: 'keyword',
          wait: true, // Ensure index creation is synchronous
        });
      } else {
      }
    } catch (error) {
      if (error.status === 404) {
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: 4,
            distance: 'Cosine',
          },
          optimizers_config: {
            deleted_threshold: 0.9,
          },
        });

        // Create index on 'email' field
        await this.client.createPayloadIndex(this.collectionName, {
          field_name: 'email',
          field_schema: 'keyword',
          wait: true,
        });
      } else {
        console.error("Error checking/creating collection:", error.message, error.status, error.data);
        throw error;
      }
    }
  }

  async register(email, password, role = 'user', fullName) {
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      throw new Error("Invalid email or password");
    }

    await this.ensureCollection();

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateId();

    const point = {
      id: userId,
      vector: [0.1, 0.2, 0.3, 0.4],
      payload: { email, password: hashedPassword, role, fullName },
    };

     await this.client.upsert(this.collectionName, { wait: true, points: [point] });

    return { id: userId, email, role, fullName };
  }

  async login(email, password) {
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      throw new Error("Invalid email or password");
    }

    try {
      const response = await this.client.scroll(this.collectionName, {
        filter: {
          must: [
            {
              key: "email",
              match: { value: email },
            },
          ],
        },
        limit: 1,
        with_payload: true,
      });


      if (!response.points || response.points.length === 0) {
        console.log("No user found for email:", email);
        return null;
      }

      const user = response.points[0].payload;


      if (!user || !user.password) {
        console.log("User or password not found in payload:", user);
        return null;
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        console.log("Password mismatch for email:", email);
        return null;
      }

      return {
        id: response.points[0].id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        image: user.image,
        apiKey: user.apiKey
      };
    } catch (error) {
      console.error("Error during login:", error.message, error.status, error.data);
      throw new Error("Login failed: " + (error.message || "Bad Request"));
    }
  }

  async logout() {
    // In a token-based system, the client handles logout by deleting the token.
    // This function is here to confirm the action and for any future server-side needs.
    return { message: 'Logout confirmed' };
  }
}

module.exports = new AuthService();