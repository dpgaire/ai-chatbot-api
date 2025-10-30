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

### API Endpoints

- **Chat**: `POST /api/chat`
- **Train**: `POST /api/train`
- **Projects**: `GET, POST, PUT, DELETE /api/projects`
- **Blogs**: `GET, POST, PUT, DELETE /api/blogs`
- **Skills**: `GET, POST, PUT, DELETE /api/skills`
- **About**: `GET, POST, PUT, DELETE /api/about`
- **Contact**: `GET, POST, PUT, DELETE /api/contact`
- **Auth**: `POST /api/auth/login`
- **Stats**: `GET /api/stats`
- **Notes**: `GET, POST, PUT, DELETE /api/notes`
- **Quicklinks**: `GET, POST, PUT, DELETE /api/quicklinks`
- **Code-Log**: `GET, POST, PUT, DELETE /api/code-log`
- **Tasks**: `GET, POST, PUT, DELETE /api/tasks`
- **Expenses**: `GET, POST, PUT, DELETE /api/expenses`
- **Goals**: `GET, POST, PUT, DELETE /api/goals`
- **Key Results**: `POST, PUT, DELETE /api/goals/{goalId}/key-results`

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
PROJECT_COLLECTION_NAME=projects
BLOG_COLLECTION_NAME=blogs
SKILL_COLLECTION_NAME=skills
ABOUT_COLLECTION_NAME=about
CONTACT_COLLECTION_NAME=contact
JWT_SECRET=your-jwt-secret
TASK_COLLECTION_NAME=tasks
EXPENSES_COLLECTION_NAME=expenses
GOALS_COLLECTION_NAME=goals
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

### Expenses API

#### `POST /api/expenses`

Adds a new expense.

**Request Body:**
```json
{
  "date": "2024-01-15",
  "category": "Office Supplies",
  "amount": 50.00,
  "description": "New keyboard and mouse"
}
```

#### `GET /api/expenses`

Retrieves all expenses.

#### `GET /api/expenses/{id}`

Retrieves a single expense by ID.

#### `PUT /api/expenses/{id}`

Updates an expense.

**Request Body:**
```json
{
  "date": "2024-01-16",
  "category": "Software",
  "amount": 200.00,
  "description": "Annual software license"
}
```

#### `DELETE /api/expenses/{id}`

Deletes an expense.

### Goals API

#### `POST /api/goals`

Adds a new goal.

**Request Body:**
```json
{
  "title": "Launch New Product Feature",
  "description": "Develop and release a highly anticipated new feature to improve user engagement.",
  "targetDate": "2025-12-31"
}
```

#### `GET /api/goals`

Retrieves all goals.

#### `GET /api/goals/{id}`

Retrieves a single goal by ID.

#### `PUT /api/goals/{id}`

Updates a goal.

**Request Body:**
```json
{
  "title": "Launch V2 of New Product Feature",
  "description": "Develop and release V2 of the new feature.",
  "targetDate": "2026-06-30"
}
```

#### `DELETE /api/goals/{id}`

Deletes a goal.

### Key Results API

#### `POST /api/goals/{goalId}/key-results`

Adds a new key result to a goal.

**Request Body:**
```json
{
  "title": "Achieve 10% increase in daily active users",
  "targetValue": 10
}
```

#### `PUT /api/goals/{goalId}/key-results/{krId}`

Updates a key result.

**Request Body:**
```json
{
  "title": "Achieve 20% increase in daily active users",
  "targetValue": 20
}
```

#### `DELETE /api/goals/{goalId}/key-results/{krId}`

Deletes a key result.

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

