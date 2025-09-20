# Deployment Guide

## Quick Start

### 1. Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your API keys
nano .env

# Start development server
npm run dev
```

### 2. Vercel Deployment

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: GitHub Integration
1. Push code to GitHub repository
2. Connect repository to Vercel dashboard
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### 3. Environment Variables

Set these in Vercel dashboard or `.env` file:

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google AI Studio API key | `AIza...` |
| `QDRANT_URL` | Qdrant cluster URL | `https://xyz.qdrant.tech:6333` |
| `QDRANT_API_KEY` | Qdrant API key | `qdr_...` |
| `COLLECTION_NAME` | Collection name | `personal_data` |

### 4. Testing Deployment

```bash
# Test training endpoint
curl -X POST https://your-app.vercel.app/api/train \
  -H "Content-Type: application/json" \
  -d '{"id": "test", "text": "This is a test"}'

# Test chat endpoint  
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Hello"}'
```

## Free Tier Limits

### Qdrant Cloud (Free)
- 1GB storage
- 100K vectors
- 1 cluster

### Google AI Studio (Free)
- 15 requests per minute
- 1 million tokens per day
- Rate limits apply

### Vercel (Free)
- 100GB bandwidth
- 100 serverless function invocations per day
- 10 second execution limit

## Production Considerations

1. **Rate Limiting**: Implement rate limiting for production use
2. **Authentication**: Add API key authentication
3. **Monitoring**: Set up logging and monitoring
4. **Error Handling**: Enhanced error tracking
5. **Caching**: Implement response caching
6. **Scaling**: Consider upgrading to paid tiers for higher usage

