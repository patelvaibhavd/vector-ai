# Vector-AI

## Unlocking Intelligence - Your Path to AI-Powered Document Search

---

# Scope of the Project

## Project Title
**Vector-AI: PDF Question Answering System with RAG**

## Project Objectives

1. **Document Processing**: Enable users to upload PDF documents and automatically extract, process, and index text content for semantic search.

2. **Intelligent Q&A**: Implement a question-answering system that retrieves relevant document sections and generates accurate answers using RAG (Retrieval-Augmented Generation).

3. **Flexible AI Integration**: Support both OpenAI (cloud) and local Transformers.js models for embedding generation, enabling offline capability.

4. **RESTful API**: Provide a clean, well-documented REST API for seamless integration with frontend applications or other services.

## Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 1 | PDF Upload API | Endpoint to upload and process PDF documents |
| 2 | Vector Store | In-memory storage for document embeddings and metadata |
| 3 | Semantic Search | Cosine similarity-based search across document chunks |
| 4 | Q&A System | Question answering with context-aware responses |
| 5 | Document Management | APIs to list, retrieve, and delete documents |
| 6 | Postman Collection | Ready-to-use API testing collection |

---

# Design

## Design Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VECTOR-AI ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   User/Client   │
                              └────────┬────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              EXPRESS.JS SERVER                               │
│  ┌────────────┐  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │   CORS     │  │  JSON Parser   │  │ Error Handler  │  │    Multer     │  │
│  │ Middleware │  │   Middleware   │  │   Middleware   │  │ File Upload   │  │
│  └────────────┘  └────────────────┘  └────────────────┘  └───────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
         ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
         │  /api/documents  │ │   /api/search    │ │     /health      │
         │                  │ │                  │ │                  │
         │  • POST /upload  │ │  • POST /query   │ │  • GET /         │
         │  • GET /         │ │  • GET /stats    │ │                  │
         │  • GET /:id      │ │                  │ │                  │
         │  • DELETE /:id   │ │                  │ │                  │
         └────────┬─────────┘ └────────┬─────────┘ └──────────────────┘
                  │                    │
                  ▼                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              SERVICES LAYER                                  │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────────┐ │
│  │   PDF Service      │  │ Embedding Service  │  │    Vector Service      │ │
│  │                    │  │                    │  │                        │ │
│  │  • Extract text    │  │  • OpenAI API      │  │  • Store embeddings    │ │
│  │  • Chunk text      │  │  • Local Model     │  │  • Cosine similarity   │ │
│  │  • Sentence split  │  │  • GPT answers     │  │  • Search & retrieve   │ │
│  └────────────────────┘  └────────────────────┘  └────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
                  │                    │                    │
                  ▼                    ▼                    ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│    File System       │  │   OpenAI API /       │  │   In-Memory Store    │
│    (uploads/)        │  │   Transformers.js    │  │   (Vector Store)     │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

## Design Description

### Document Upload & Processing Module
- Accepts PDF files via multipart form upload (max 10MB)
- Extracts text using **pdf-parse** library
- Splits text into overlapping chunks (300 chars with 30 char overlap)
- Generates vector embeddings for each chunk
- Stores document metadata and embeddings in vector store

### RAG (Retrieval-Augmented Generation) Module
- Converts user questions into vector embeddings
- Performs cosine similarity search across all indexed chunks
- Retrieves top-K most relevant document sections
- Passes context to LLM for answer generation

### Embedding Service
- **OpenAI Mode**: Uses `text-embedding-3-small` model (1536 dimensions)
- **Local Mode**: Uses `all-MiniLM-L6-v2` via Transformers.js (384 dimensions)
- Supports batch processing for efficient indexing

### Answer Generation
- **OpenAI Mode**: GPT-4o-mini generates contextual answers
- **Local Mode**: Returns extractive answers from relevant chunks
- Includes source citations and similarity scores

---

## Workflow

### Document Indexing Flow

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│   Upload    │────▶│  Text Extract   │────▶│   Chunking   │────▶│  Embedding   │
│   PDF File  │     │  (pdf-parse)    │     │ (300 chars)  │     │  Generation  │
└─────────────┘     └─────────────────┘     └──────────────┘     └──────────────┘
                                                                        │
                                                                        ▼
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│  Response   │◀────│  Generate UUID  │◀────│ Store in     │◀────│   Vectors    │
│  with ID    │     │  Document ID    │     │ Vector Store │     │   Created    │
└─────────────┘     └─────────────────┘     └──────────────┘     └──────────────┘
```

### Question Answering Flow

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│   User      │────▶│ Embed Question  │────▶│   Vector     │────▶│  Top-K       │
│   Question  │     │ (Same model)    │     │   Search     │     │  Results     │
└─────────────┘     └─────────────────┘     └──────────────┘     └──────────────┘
                                                                        │
                                                                        ▼
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│  JSON       │◀────│  Format with    │◀────│  GPT/Local   │◀────│   Context    │
│  Response   │     │  Sources        │     │  Answer Gen  │     │   Assembly   │
└─────────────┘     └─────────────────┘     └──────────────┘     └──────────────┘
```

---

# Test Cases

## Positive Test Cases

| TC # | Test Case Name | Description | Expected Result |
|------|----------------|-------------|-----------------|
| TC-01 | Document Upload Success | Upload a valid PDF document | Document indexed with unique ID, chunk count returned |
| TC-02 | Question Submission | Submit question with valid documentId | AI-generated answer with relevant sources |
| TC-03 | Embedding Creation | Upload PDF and verify embeddings | All chunks have valid embedding vectors |
| TC-04 | RAG Functionality | Ask question about document content | Answer based on relevant document sections |
| TC-05 | OpenAI Integration | Query with OpenAI provider enabled | GPT-generated contextual answer |
| TC-06 | Local Model Fallback | Query with local provider | Extractive answer from Transformers.js |
| TC-07 | Multi-Document Search | Query across multiple documents | Results from all relevant documents |
| TC-08 | Document Listing | GET /api/documents | List of all indexed documents |
| TC-09 | Document Retrieval | GET /api/documents/:id | Document details with metadata |
| TC-10 | Document Deletion | DELETE /api/documents/:id | Document and file removed successfully |

## Negative Test Cases

| TC # | Test Case Name | Description | Expected Result |
|------|----------------|-------------|-----------------|
| TC-11 | Upload No File | POST without file attachment | 400 Error: "No file uploaded" |
| TC-12 | Upload Invalid Format | Upload non-PDF file | 400 Error: "Only PDF files are allowed" |
| TC-13 | Upload Oversized File | Upload file > 10MB | 400 Error: "File too large" |
| TC-14 | Query Empty Question | POST with empty question | 400 Error: "Question is required" |
| TC-15 | Query Invalid Document | Query with non-existent documentId | 404 Error: "Document not found" |
| TC-16 | Delete Non-existent | DELETE with invalid ID | 404 Error: "Document not found" |
| TC-17 | OpenAI Key Missing | Use OpenAI without API key | Config validation error on startup |
| TC-18 | OpenAI Quota Exceeded | API call with exhausted quota | 500 Error with user-friendly message |
| TC-19 | Empty PDF Upload | Upload PDF with no text content | Error: "No text content found" |
| TC-20 | Low Similarity Results | Query unrelated to documents | "No relevant information found" |

---

# Tools and Code Details

## Third Party Tools/Libraries

| Tool/Library | Open Source/Licensed | URL | Purpose |
|--------------|---------------------|-----|---------|
| Express.js | Open Source (MIT) | https://expressjs.com/ | REST API framework |
| OpenAI SDK | Open Source (Apache 2.0) | https://www.npmjs.com/package/openai | OpenAI API integration |
| Transformers.js | Open Source (Apache 2.0) | https://www.npmjs.com/package/@xenova/transformers | Local ML embeddings |
| pdf-parse | Open Source (MIT) | https://www.npmjs.com/package/pdf-parse | PDF text extraction |
| Multer | Open Source (MIT) | https://www.npmjs.com/package/multer | File upload handling |
| UUID | Open Source (MIT) | https://www.npmjs.com/package/uuid | Unique ID generation |
| dotenv | Open Source (BSD-2) | https://www.npmjs.com/package/dotenv | Environment configuration |
| CORS | Open Source (MIT) | https://www.npmjs.com/package/cors | Cross-origin requests |

## Technologies Used

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Backend runtime environment |
| JavaScript (ES Modules) | ES2022 | Programming language |
| OpenAI GPT-4o-mini | Latest | Answer generation (LLM) |
| OpenAI text-embedding-3-small | Latest | Vector embeddings (1536D) |
| all-MiniLM-L6-v2 | v2.17.2 | Local embeddings (384D) |
| REST API | - | API architecture |
| Postman | Latest | API testing |

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/documents/upload` | Upload PDF document |
| GET | `/api/documents` | List all documents |
| GET | `/api/documents/:id` | Get document details |
| DELETE | `/api/documents/:id` | Delete document |
| POST | `/api/search/query` | Ask question |
| GET | `/api/search/stats` | Get statistics |

---

# Project Structure

```
vector-ai/
├── src/
│   ├── config/
│   │   └── index.js              # Configuration & validation
│   ├── middleware/
│   │   ├── errorHandler.js       # Global error handling
│   │   └── upload.js             # Multer file upload config
│   ├── routes/
│   │   ├── document.routes.js    # Document CRUD endpoints
│   │   └── search.routes.js      # Search & query endpoints
│   ├── services/
│   │   ├── embedding.service.js  # OpenAI & local embeddings
│   │   ├── pdf.service.js        # PDF processing & chunking
│   │   └── vector.service.js     # Vector store & search
│   └── index.js                  # Application entry point
├── uploads/                      # PDF file storage
├── postman/                      # Postman collection
├── docs/                         # Documentation
├── package.json                  # Dependencies
└── README.md                     # Project readme
```

---

# Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `EMBEDDING_PROVIDER` | openai | `openai` or `local` |
| `OPENAI_API_KEY` | - | OpenAI API key |
| `OPENAI_EMBEDDING_MODEL` | text-embedding-3-small | Embedding model |
| `OPENAI_CHAT_MODEL` | gpt-4o-mini | Chat model |
| `PORT` | 3000 | Server port |
| `CHUNK_SIZE` | 300 | Characters per chunk |
| `CHUNK_OVERLAP` | 30 | Overlap between chunks |
| `TOP_K_RESULTS` | 1 | Results to retrieve |
| `SIMILARITY_THRESHOLD` | 0.3 | Minimum similarity |
| `MAX_FILE_SIZE` | 10MB | Max upload size |

---

<div align="center">

## Thank You

**Vector-AI** - Intelligent Document Search & Q&A

</div>

