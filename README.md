# Vector AI - PDF Question Answering with Vector Search

A Node.js REST API that enables semantic search and question-answering on PDF documents. Supports both **OpenAI embeddings** for production quality and **local AI models** for offline use.

## ✨ Features

- 📄 **PDF Upload & Processing**: Upload PDF files and automatically extract text
- 🔍 **Vector Search**: Find relevant document sections using semantic similarity
- 🧠 **OpenAI Integration**: Use OpenAI embeddings + GPT for high-quality answers
- 🤖 **Local Fallback**: Optionally use Transformers.js - runs entirely on your machine
- 📚 **Multi-Document Support**: Index and search across multiple documents
- 🚀 **RESTful API**: Clean, easy-to-use API endpoints

## Architecture

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   PDF File  │────▶│  Text Extraction │────▶│  Chunking    │
└─────────────┘     └─────────────────┘     └──────────────┘
                                                    │
                                                    ▼
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Answer    │◀────│  Relevant Chunks │◀────│  Vector      │
│   Response  │     │   Combined      │     │  Similarity  │
└─────────────┘     └─────────────────┘     │  Search      │
                                            └──────────────┘
                                                    ▲
                                                    │
                    ┌─────────────────┐     ┌──────────────┐
                    │  User Question  │────▶│  Local       │
                    └─────────────────┘     │  Embedding   │
                                            └──────────────┘
```

## Prerequisites

- Node.js 18+
- OpenAI API key (for production-quality embeddings & answers)
  - OR use local mode for free, offline operation

## Installation

1. **Navigate to the project:**
   ```bash
   cd vector-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

   > ⏳ First startup downloads the embedding model (~80MB) - this only happens once!

## API Endpoints

### Health Check
```bash
GET /health
```

### Upload Document
```bash
POST /api/documents/upload
Content-Type: multipart/form-data

# Form field: document (PDF file)
```

**Example with curl:**
```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -F "document=@/path/to/your/document.pdf"
```

**Response:**
```json
{
  "success": true,
  "message": "Document uploaded and indexed successfully",
  "data": {
    "documentId": "uuid-here",
    "filename": "document.pdf",
    "totalChunks": 15,
    "totalCharacters": 5000
  }
}
```

### List Documents
```bash
GET /api/documents
```

### Get Document Details
```bash
GET /api/documents/:id
```

### Delete Document
```bash
DELETE /api/documents/:id
```

**Example with curl:**
```bash
curl -X DELETE http://localhost:3000/api/documents/your-document-id
```

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully",
  "data": {
    "deletedDocumentId": "uuid-here",
    "deletedFile": "document.pdf"
  }
}
```

> 📝 This removes both the document from the vector store AND deletes the uploaded PDF file from the server.

### Search & Ask Questions
```bash
POST /api/search/query
Content-Type: application/json

{
  "question": "What is the main topic discussed in the document?",
  "documentId": "optional-uuid-to-search-specific-document"
}
```

**Example with curl:**
```bash
curl -X POST http://localhost:3000/api/search/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the key findings?"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "Based on the document, the key findings include...",
    "bestMatch": {
      "text": "The most relevant text chunk from the document...",
      "similarity": "92%",
      "document": "report.pdf"
    },
    "sources": [
      {
        "documentId": "uuid",
        "documentName": "report.pdf",
        "text": "Preview of the relevant text (truncated at word boundary)...",
        "similarity": "92%"
      }
    ],
    "question": "What are the key findings?"
  }
}
```

### Get Search Statistics
```bash
GET /api/search/stats
```

## Configuration Options

Create a `.env` file:

```env
# Embedding Provider: 'openai' (recommended) or 'local'
EMBEDDING_PROVIDER=openai

# OpenAI Configuration (required when EMBEDDING_PROVIDER=openai)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini

# Server Configuration
PORT=3000
CHUNK_SIZE=300
CHUNK_OVERLAP=30
TOP_K_RESULTS=1
SIMILARITY_THRESHOLD=0.3
MAX_FILE_SIZE=10485760
```

| Variable | Default | Description |
|----------|---------|-------------|
| `EMBEDDING_PROVIDER` | openai | `openai` for OpenAI, `local` for Transformers.js |
| `OPENAI_API_KEY` | - | Your OpenAI API key |
| `OPENAI_EMBEDDING_MODEL` | text-embedding-3-small | OpenAI embedding model |
| `OPENAI_CHAT_MODEL` | gpt-4o-mini | GPT model for generating answers |
| `PORT` | 3000 | Server port |
| `CHUNK_SIZE` | 300 | Max characters per text chunk |
| `CHUNK_OVERLAP` | 30 | Overlap between chunks for context |
| `TOP_K_RESULTS` | 1 | Number of relevant chunks to retrieve |
| `SIMILARITY_THRESHOLD` | 0.3 | Minimum similarity score (0-1) to include in results |
| `MAX_FILE_SIZE` | 10485760 | Max upload file size (10MB) |

### OpenAI vs Local Mode

| Feature | OpenAI Mode | Local Mode |
|---------|-------------|------------|
| **Embedding Quality** | High (1536 dimensions) | Good (384 dimensions) |
| **Answer Generation** | GPT-powered contextual answers | Extractive (returns relevant chunks) |
| **Cost** | Per-token pricing | Free |
| **Speed** | Fast (API calls) | Slower first run (downloads model) |
| **Offline** | No | Yes |

## How It Works

1. **Document Upload**: When you upload a PDF, the system:
   - Extracts all text content
   - Splits text into overlapping chunks (for context preservation)
   - Generates vector embeddings using **all-MiniLM-L6-v2** (local model)
   - Stores chunks with their embeddings in memory

2. **Question Answering**: When you ask a question:
   - Generates an embedding for your question locally
   - Finds the most similar document chunks using cosine similarity
   - Returns the relevant chunks as the answer

## Project Structure

```
vector-ai/
├── src/
│   ├── config/
│   │   └── index.js          # Configuration management
│   ├── middleware/
│   │   ├── errorHandler.js   # Error handling
│   │   └── upload.js         # File upload configuration
│   ├── routes/
│   │   ├── document.routes.js  # Document CRUD endpoints
│   │   └── search.routes.js    # Search & query endpoints
│   ├── services/
│   │   ├── embedding.service.js  # Local embeddings (Transformers.js)
│   │   ├── pdf.service.js        # PDF text extraction
│   │   └── vector.service.js     # Vector store & search
│   └── index.js              # Application entry point
├── uploads/                  # Uploaded PDF storage
├── postman/                  # Postman collection
├── package.json
└── README.md
```

## Tech Stack

- **Express.js** - REST API framework
- **OpenAI API** - Embeddings (text-embedding-3-small) & Chat (GPT-4o-mini)
- **Transformers.js** - Local ML embeddings fallback (Hugging Face)
- **all-MiniLM-L6-v2** - Local embedding model (384 dimensions)
- **pdf-parse** - PDF text extraction
- **Multer** - File upload handling

## Postman Collection

A ready-to-use Postman collection is included in the `postman/` folder:

1. Import `postman/Vector-AI.postman_collection.json` into Postman
2. The collection includes all API endpoints with examples
3. When you upload a document, the `documentId` is automatically saved for subsequent requests

## Notes

- The vector store is **in-memory**, so documents are lost on server restart
- First startup downloads the embedding model (~80MB one-time download)
- For production, consider using a persistent vector database like Pinecone, Weaviate, Chroma, or PostgreSQL with pgvector

## License

MIT
