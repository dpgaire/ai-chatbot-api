# Personal AI Chatbot with Qdrant Vector Database

A serverless Node.js application that creates a personal AI chatbot using Qdrant vector database for storing and searching personal data. The chatbot uses Google's Gemini API for generating embeddings and intelligent responses based on your personal data context.

## Features

- **Vector-based Personal Data Storage**: Store and index your personal text data using Qdrant vector database
- **Intelligent Context Retrieval**: Find relevant information from your personal data using semantic search
- **AI-Powered Responses**: Generate contextual responses using Google's Gemini API
- **Serverless Architecture**: Fully compatible with Vercel serverless deployment
- **RESTful API**: Simple JSON-based API endpoints for training and chatting
- **CORS Support**: Cross-origin requests enabled for frontend integration
- **Error Handling**: Comprehensive error handling and validation

## Architecture

The application consists of two main API endpoints:

1. **`/api/train`** - Stores personal data as vector embeddings
2. **`/api/chat`** - Retrieves context and generates AI responses

## Prerequisites

- Node.js 18+ 
- Qdrant Cloud account (free tier available)
- Google AI Studio account for Gemini API (free tier available)
- Vercel account for deployment (optional)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd ai-chatbot-qdrant
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
GEMINI_API_KEY=your_gemini_api_key_here
QDRANT_URL=https://your-qdrant-cluster.qdrant.tech:6333
QDRANT_API_KEY=your_qdrant_api_key_here
COLLECTION_NAME=personal_data
```

### 3. Getting API Keys

#### Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key to your `.env` file

#### Qdrant Setup
1. Visit [Qdrant Cloud](https://cloud.qdrant.io/)
2. Create a free account
3. Create a new cluster
4. Copy the cluster URL and API key to your `.env` file

### 4. Local Development

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### 5. Vercel Deployment

#### Environment Variables Setup
In your Vercel dashboard, add the following environment variables:

- `GEMINI_API_KEY`: Your Gemini API key
- `QDRANT_URL`: Your Qdrant cluster URL
- `QDRANT_API_KEY`: Your Qdrant API key  
- `COLLECTION_NAME`: Your collection name (default: personal_data)

#### Deploy
```bash
vercel --prod
```

## API Documentation

### POST /api/train

Stores personal data as vector embeddings in Qdrant.

**Request Body:**
```json
{
  "id": "unique_identifier",
  "text": "Your personal data text to store"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Text successfully trained and stored",
  "id": "unique_identifier",
  "textLength": 150,
  "embeddingSize": 768
}
```

### POST /api/chat

Queries the chatbot with context retrieval from personal data.

**Request Body:**
```json
{
  "query": "Your question or message"
}
```

**Response:**
```json
{
  "success": true,
  "query": "Your question or message",
  "response": "AI-generated response based on context",
  "context": {
    "documentsFound": 2,
    "relevantDocs": [
      {
        "id": "doc1",
        "relevanceScore": 0.85,
        "textPreview": "Preview of relevant text...",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  "metadata": {
    "queryLength": 25,
    "embeddingSize": 768,
    "responseLength": 200
  }
}
```

## Usage Examples

### Training the Chatbot

Store personal information about yourself:

```bash
# Store personal information
curl -X POST http://localhost:3000/api/train \
  -H "Content-Type: application/json" \
  -d '{
    "id": "personal_info_1",
    "text": "I am a software developer who loves working with AI and machine learning. I have 5 years of experience in Python and JavaScript."
  }'

# Store work experience
curl -X POST http://localhost:3000/api/train \
  -H "Content-Type: application/json" \
  -d '{
    "id": "work_experience_1", 
    "text": "I worked at TechCorp from 2020-2023 as a Senior Developer, where I led a team of 4 developers and built scalable web applications using React and Node.js."
  }'

# Store interests and hobbies
curl -X POST http://localhost:3000/api/train \
  -H "Content-Type: application/json" \
  -d '{
    "id": "interests_1",
    "text": "In my free time, I enjoy hiking, reading science fiction novels, and experimenting with new programming languages. I am particularly interested in Rust and Go."
  }'
```

### Chatting with the Bot

Ask questions about your stored personal data:

```bash
# Ask about work experience
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Tell me about my work experience"
  }'

# Ask about technical skills
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What programming languages do I know?"
  }'

# Ask about hobbies
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What do I like to do in my free time?"
  }'

# General conversation
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What should I learn next based on my interests?"
  }'
```

## Project Structure

```
ai-chatbot-qdrant/
├── api/
│   ├── train.js          # Training endpoint
│   └── chat.js           # Chat endpoint
├── lib/
│   ├── qdrant-client.js  # Qdrant database utilities
│   └── gemini-client.js  # Gemini API utilities
├── package.json          # Dependencies and scripts
├── vercel.json          # Vercel deployment config
├── .env.example         # Environment variables template
└── README.md           # This file
```

## Error Handling

The API includes comprehensive error handling for:

- Missing or invalid environment variables
- Invalid request methods (only POST allowed)
- Missing required fields in request body
- Invalid data types
- API connection failures
- Database operation failures

All errors return appropriate HTTP status codes and descriptive error messages.

## Security Considerations

- API keys are stored as environment variables
- CORS is configured to allow cross-origin requests
- Input validation prevents malformed requests
- Error messages don't expose sensitive information

## Limitations

- Uses free tiers of Qdrant and Gemini API (rate limits apply)
- Embedding size is fixed at 768 dimensions (Gemini text-embedding-004)
- Collection is created automatically but not deleted
- No authentication/authorization implemented

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions:
1. Check the error messages in the API responses
2. Verify your environment variables are correctly set
3. Ensure your Qdrant cluster and Gemini API are accessible
4. Check the Vercel function logs if deployed

## Troubleshooting

### Common Issues

**"Missing required environment variables"**
- Verify all environment variables are set in `.env` file
- For Vercel deployment, check environment variables in dashboard

**"Failed to generate embedding"**
- Check your Gemini API key is valid
- Verify you haven't exceeded API rate limits

**"Collection creation failed"**
- Verify Qdrant URL and API key are correct
- Check Qdrant cluster is running and accessible

**"CORS errors in browser"**
- CORS is pre-configured, but ensure you're making requests to the correct URL
- For local development, use `http://localhost:3000`

