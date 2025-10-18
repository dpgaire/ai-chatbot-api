
# Prompt for Integrating Backend Services into a React Chat Application

## 1. Objective

Integrate a pre-existing React chat application with a backend API for user and chat history management. The current implementation uses local storage for data persistence, which needs to be replaced with API calls to the provided backend endpoints.

## 2. Backend API Details

**Base URL:** `http://localhost:3000/api/chat`

### 2.1. User Management

#### Create a New User

- **Endpoint:** `POST /user-entry`
- **Request Body:**
  ```json
  {
    "fullName": "John Doe",
    "email": "john.doe@example.com"
  }
  ```
- **Response Body:**
  ```json
  {
    "success": true,
    "user": {
      "id": 1760457117528,
      "payload": {
        "fullName": "John Doe",
        "email": "john.doe@example.com"
      }
    }
  }
  ```

#### Get All Users

- **Endpoint:** `GET /users`
- **Response Body:**
  ```json
  {
    "success": true,
    "users": [
      {
        "id": 1760457117528,
        "payload": {
          "fullName": "John Doe",
          "email": "john.doe@example.com"
        }
      }
    ]
  }
  ```

### 2.2. Chat History Management

#### Create a New Chat History

- **Endpoint:** `POST /history`
- **Request Body:**
  ```json
  {
    "userId": 1760457117528,
    "title": "About Him",
    "messages": [
      {
        "id": 1760457117528,
        "text": "👋 Hello! I'm Durga's AI Assistant. How can I help you today?",
        "sender": "bot",
        "type": "welcome"
      }
    ]
  }
  ```
- **Response Body:**
  ```json
  {
    "success": true,
    "chatHistory": {
      "id": 1760781555266,
      "payload": {
        "userId": 1760457117528,
        "title": "About Him",
        "messages": [
          {
            "id": 1760457117528,
            "text": "👋 Hello! I'm Durga's AI Assistant. How can I help you today?",
            "sender": "bot",
            "type": "welcome"
          }
        ]
      }
    }
  }
  ```

#### Get All Chat Histories for a User

- **Endpoint:** `GET /history/{userId}`
- **Response Body:**
  ```json
  {
    "success": true,
    "chatHistory": [
      {
        "id": 1760781555266,
        "payload": {
          "userId": 1760457117528,
          "title": "About Him",
          "messages": [
            {
              "id": 1760457117528,
              "text": "👋 Hello! I'm Durga's AI Assistant. How can I help you today?",
              "sender": "bot",
              "type": "welcome"
            }
          ]
        }
      }
    ]
  }
  ```

#### Get a Specific Chat History

- **Endpoint:** `GET /history/{userId}/{chatId}`
- **Response Body:**
  ```json
  {
    "success": true,
    "chatHistory": {
      "id": 1760781555266,
      "payload": {
        "userId": 1760457117528,
        "title": "About Him",
        "messages": [
          {
            "id": 1760457117528,
            "text": "👋 Hello! I'm Durga's AI Assistant. How can I help you today?",
            "sender": "bot",
            "type": "welcome"
          }
        ]
      }
    }
  }
  ```

#### Update Chat History Title

- **Endpoint:** `PATCH /history/{userId}/{chatId}`
- **Request Body:**
  ```json
  {
    "title": "New Chat Title"
  }
  ```
- **Response Body:**
  ```json
  {
    "success": true,
    "chatHistory": {
      "id": 1760781555266,
      "payload": {
        "userId": 1760457117528,
        "title": "New Chat Title",
        "messages": [
          {
            "id": 1760457117528,
            "text": "👋 Hello! I'm Durga's AI Assistant. How can I help you today?",
            "sender": "bot",
            "type": "welcome"
          }
        ]
      }
    }
  }
  ```

#### Delete Chat History

- **Endpoint:** `DELETE /history/{userId}/{chatId}`
- **Response Body:**
  ```json
  {
    "success": true,
    "message": "Chat history deleted successfully"
  }
  ```

### 2.3. Chatting

#### Send a Message

- **Endpoint:** `POST /`
- **Request Body:**
  ```json
  {
    "query": "What is his skills?"
  }
  ```
- **Response Body:**
  ```json
  {
    "success": true,
    "query": "What is his skills?",
    "response": "He possesses strong skills in deep focus, creativity, and self-learning..."
  }
  ```

## 3. Implementation Steps

1.  **Create an API service module:** Create a new file `src/services/api.js` to encapsulate all API calls using `fetch` or a library like `axios`. This module should export functions for each endpoint.

2.  **Replace local storage with API calls:**
    -   On application load, instead of reading from local storage, call the `GET /users` and `GET /history/{userId}` endpoints to fetch the initial data.
    -   When a new user is created, call the `POST /user-entry` endpoint and update the application state with the new user from the response.
    -   When a new chat is started, call the `POST /history` endpoint and update the application state with the new chat history.
    -   When a chat title is updated, call the `PATCH /history/{userId}/{chatId}` endpoint.
    -   When a chat is deleted, call the `DELETE /history/{userId}/{chatId}` endpoint.

3.  **Integrate the chat functionality:**
    -   When a user sends a message, call the `POST /` endpoint with the user's query.
    -   Append the user's message and the bot's response to the chat history.
    -   Call the `POST /history` endpoint to save the updated chat history.

## 4. Data Structures

### User

```javascript
{
  "id": 1760457117528,
  "payload": {
    "fullName": "John Doe",
    "email": "john.doe@example.com"
  }
}
```

### Chat History

```javascript
{
  "id": 1760781555266,
  "payload": {
    "userId": 1760457117528,
    "title": "About Him",
    "messages": [
      {
        "id": 1760457117528,
        "text": "👋 Hello! I'm Durga's AI Assistant. How can I help you today?",
        "sender": "bot",
        "type": "welcome"
      },
      {
        "id": 1760781555266,
        "text": "What is his skills?",
        "sender": "user"
      },
      {
        "id": 1760781560011,
        "text": "He possesses strong skills in deep focus, creativity, and self-learning...",
        "sender": "bot"
      }
    ]
  }
}
```
