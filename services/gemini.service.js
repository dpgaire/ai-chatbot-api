const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiManager {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.embeddingModel = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
    this.chatModel = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async generateEmbedding(text) {
    try {
      const result = await this.embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  async generateResponse(query, context = []) {
    try {
          let prompt = `You are a helpful personal AI assistant with access to the user's relationship in collection. 
Answer the user's question directly and naturally, without prefacing with phrases like 
"Based on your provided data" or "Thank you for asking". 
Do not add unnecessary disclaimers. 
If relevant context is provided, weave it naturally into the answer. 
If no context is relevant, give a general helpful response. 

User Question: ${query}`;

      if (context.length > 0) {
        prompt += `\n\nRelevant Context from Personal Data:\n`;
        context.forEach((item, index) => {
          prompt += `${index + 1}. ${item.payload.content} (Relevance: ${(item.score * 100).toFixed(1)}%)\n`;
        });
        prompt += `\nPlease provide a helpful response based on the context above. If the context doesn't contain relevant information, let the user know and provide a general helpful response.`;
      } else {
        prompt += `\n\nNo relevant context found in personal data. Please provide a general helpful response.`;
      }

      const result = await this.chatModel.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate response');
    }
  }
}

module.exports = GeminiManager;
