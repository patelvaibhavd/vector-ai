# Vector AI - PDF Question Answering with Vector Search

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/Angular-17-red?style=for-the-badge&logo=angular" alt="Angular">
  <img src="https://img.shields.io/badge/OpenAI-Powered-blue?style=for-the-badge&logo=openai" alt="OpenAI">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT License">
</p>

A full-stack application for semantic search and question-answering on PDF documents. Features a Node.js REST API backend with RAG (Retrieval-Augmented Generation) and a modern Angular frontend.

## ✨ Features

### Backend
- 📄 **Document Processing**: Upload PDF or TXT files and automatically extract text
- 🔍 **Vector Search**: Semantic similarity search using embeddings
- 🧠 **OpenAI Integration**: High-quality embeddings + GPT for answers
- 🤖 **Local Fallback**: Transformers.js for offline operation
- 📚 **Multi-Document**: Search across multiple indexed documents
- 🚀 **RESTful API**: Clean, well-documented endpoints

### Frontend
- 🎨 **Modern UI**: Dark/Light theme with neon accents
- 📤 **Drag & Drop**: Easy PDF/TXT upload experience
- 💬 **Interactive Q&A**: Ask questions, get AI answers
- 💡 **Sample Questions**: Built-in test questions by difficulty
- 📊 **Real-time Stats**: Monitor system status & AI providers
- 📱 **Responsive**: Works on all devices

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          VECTOR AI STACK                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    ANGULAR FRONTEND                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │   │
│  │  │  Upload  │  │Documents │  │  Search  │  │  Stats   │    │   │
│  │  │Component │  │Component │  │Component │  │Component │    │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   EXPRESS.JS BACKEND                         │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │   │
│  │  │ /api/documents│  │  /api/search  │  │    /health    │   │   │
│  │  └───────────────┘  └───────────────┘  └───────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     SERVICES LAYER                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │   │
│  │  │PDF Service  │  │  Embedding  │  │   Vector    │         │   │
│  │  │(pdf-parse)  │  │  Service    │  │   Store     │         │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│          ┌───────────────────┼───────────────────┐                 │
│          ▼                   ▼                   ▼                 │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐           │
│  │  OpenAI API  │   │Transformers.js│   │ In-Memory   │           │
│  │  (Optional)  │   │   (Local)    │   │Vector Store │           │
│  └──────────────┘   └──────────────┘   └──────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
vector-ai/
├── src/                        # Backend source code
│   ├── config/
│   │   └── config.js           # Configuration management
│   ├── middleware/
│   │   ├── errorHandler.js     # Error handling
│   │   └── upload.js           # File upload config
│   ├── routes/
│   │   ├── document.routes.js  # Document CRUD endpoints
│   │   └── search.routes.js    # Search & query endpoints
│   ├── services/
│   │   ├── embedding.service.js # Embeddings (OpenAI/local)
│   │   ├── pdf.service.js      # PDF text extraction
│   │   └── vector.service.js   # Vector store & search
│   └── index.js                # Application entry point
├── frontend/                   # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # UI components
│   │   │   ├── models/         # TypeScript interfaces
│   │   │   └── services/       # API services
│   │   ├── environments/       # Environment configs
│   │   └── styles.css          # Global styles
│   ├── angular.json            # Angular config
│   └── package.json            # Frontend dependencies
├── uploads/                    # PDF file storage
├── postman/                    # API test collection
├── docs/                       # Documentation
├── render.yaml                 # Render deployment config
├── package.json                # Backend dependencies
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone & Install Backend

   ```bash
# Navigate to project
   cd vector-ai

# Install backend dependencies
   npm install

# Start backend (development)
   npm run dev
   ```

The backend will start at `http://localhost:3000`

### 2. Install & Run Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at `http://localhost:4200`

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/documents/upload` | Upload PDF document |
| GET | `/api/documents` | List all documents |
| GET | `/api/documents/:id` | Get document details |
| DELETE | `/api/documents/:id` | Delete document |
| POST | `/api/search/query` | Ask question |
| GET | `/api/search/stats` | Get statistics |

### Upload Document
```bash
# Upload PDF
curl -X POST http://localhost:3000/api/documents/upload \
  -F "document=@/path/to/your/document.pdf"

# Upload TXT
curl -X POST http://localhost:3000/api/documents/upload \
  -F "document=@/path/to/your/document.txt"
```

### Ask Question
```bash
curl -X POST http://localhost:3000/api/search/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the key findings?"}'
```

## ⚙️ Configuration

### Understanding EMBEDDING_PROVIDER vs LLM_PROVIDER

Vector AI uses two separate providers for different tasks in the RAG pipeline:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RAG PIPELINE EXPLAINED                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  STEP 1: UPLOAD PDF (uses EMBEDDING_PROVIDER)                               │
│  ┌──────────┐      ┌─────────────────────┐      ┌──────────────────┐       │
│  │   PDF    │ ───▶ │ EMBEDDING_PROVIDER  │ ───▶ │  Vector Store    │       │
│  │   Text   │      │ Converts text to    │      │  (numbers stored │       │
│  │          │      │ numbers (vectors)   │      │   for searching) │       │
│  └──────────┘      └─────────────────────┘      └──────────────────┘       │
│                                                                             │
│  STEP 2: ASK QUESTION (uses EMBEDDING_PROVIDER)                             │
│  ┌──────────┐      ┌─────────────────────┐      ┌──────────────────┐       │
│  │ Question │ ───▶ │ EMBEDDING_PROVIDER  │ ───▶ │  Find Similar    │       │
│  │          │      │ Same model as above │      │  Vectors         │       │
│  └──────────┘      └─────────────────────┘      └────────┬─────────┘       │
│                                                          │                  │
│  STEP 3: GENERATE ANSWER (uses LLM_PROVIDER)             ▼                  │
│  ┌──────────┐      ┌─────────────────────┐      ┌──────────────────┐       │
│  │  Answer  │ ◀─── │    LLM_PROVIDER     │ ◀─── │ Relevant Chunks  │       │
│  │          │      │ Generates human-    │      │ from documents   │       │
│  │          │      │ readable answers    │      │                  │       │
│  └──────────┘      └─────────────────────┘      └──────────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Config | Purpose | Options | When Used |
|--------|---------|---------|-----------|
| `EMBEDDING_PROVIDER` | Convert text → vectors (numbers) | `local`, `openai` | PDF upload & search |
| `LLM_PROVIDER` | Generate human-like answers | `local`, `groq`, `gemini`, `openai` | Question answering |

**Why separate?** Flexibility! You can mix and match:
- Use FREE local embeddings + FREE Groq for AI answers
- Use OpenAI embeddings (better search) + local answers (save money)
- Use 100% local (no API keys, works offline)

### Backend Environment Variables

Create a `.env` file in the root directory:

```env
# ===========================================
# EMBEDDING PROVIDER (for vector search)
# ===========================================
# Converts text to vectors for similarity search
# Options: 'local' (FREE), 'openai' (paid)
EMBEDDING_PROVIDER=local

# ===========================================
# LLM PROVIDER (for answer generation)
# ===========================================
# Generates human-readable answers from context
# Options: 'local' (FREE), 'groq' (FREE), 'gemini' (FREE), 'openai' (paid)
LLM_PROVIDER=local

# ===========================================
# GROQ (FREE - Recommended for AI answers)
# Sign up: https://console.groq.com
# ===========================================
GROQ_API_KEY=your-groq-api-key
GROQ_CHAT_MODEL=llama-3.1-8b-instant

# ===========================================
# GOOGLE GEMINI (FREE tier available)
# Sign up: https://makersuite.google.com/app/apikey
# ===========================================
GEMINI_API_KEY=your-gemini-api-key
GEMINI_CHAT_MODEL=gemini-1.5-flash

# ===========================================
# OPENAI (Paid - Premium quality)
# ===========================================
OPENAI_API_KEY=your-openai-api-key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o-mini

# ===========================================
# SERVER CONFIGURATION
# ===========================================
PORT=3000
CHUNK_SIZE=300
CHUNK_OVERLAP=30
TOP_K_RESULTS=1
SIMILARITY_THRESHOLD=0.3
MAX_FILE_SIZE=10485760
```

### Frontend Environment

Edit `frontend/src/environments/environment.prod.ts` for production:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-url.onrender.com'
};
```

### Provider Options

#### Embedding Providers (EMBEDDING_PROVIDER)

| Provider | Cost | Dimensions | Quality | API Key |
|----------|------|------------|---------|---------|
| `local` | FREE | 384 | Good | ❌ Not needed |
| `openai` | Paid | 1536 | Excellent | ✅ Required |

#### LLM Providers (LLM_PROVIDER)

| Provider | Cost | Model | Answer Quality | API Key |
|----------|------|-------|----------------|---------|
| `local` | FREE | Extractive | Returns relevant text chunks | ❌ Not needed |
| `groq` | FREE | Llama 3.1 | AI-generated, contextual | ✅ Required |
| `gemini` | FREE | Gemini 1.5 | AI-generated, contextual | ✅ Required |
| `openai` | Paid | GPT-4o-mini | Premium AI answers | ✅ Required |

### Recommended Configurations

#### 🆓 100% FREE (No API keys)
```env
EMBEDDING_PROVIDER=local
LLM_PROVIDER=local
```
- Works offline, no signup required
- Returns relevant text from documents

#### 🚀 Best FREE (Recommended)
```env
EMBEDDING_PROVIDER=local
LLM_PROVIDER=groq
GROQ_API_KEY=your-free-groq-key
```
- FREE local embeddings
- FREE AI-powered answers (Groq Llama 3.1)
- Sign up at [console.groq.com](https://console.groq.com)

#### 💎 Premium Quality
```env
EMBEDDING_PROVIDER=openai
LLM_PROVIDER=openai
OPENAI_API_KEY=your-openai-key
```
- Best search accuracy
- Best answer quality
- Requires paid OpenAI account

## 🌐 Deployment on Render (Free Plan)

### Automatic Deployment with Blueprint

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect `render.yaml` and create both services

3. **Configure Environment**
   - Go to Backend service → Environment
   - Add `OPENAI_API_KEY` if using OpenAI mode
   - Update Frontend → set backend URL

### Manual Deployment

#### Backend
```bash
# On Render Dashboard:
# 1. Create new Web Service
# 2. Connect GitHub repo
# 3. Settings:
#    - Build Command: npm install
#    - Start Command: npm start
#    - Health Check Path: /health
```

#### Frontend
```bash
# Build production bundle
cd frontend
npm run build:prod

# Deploy dist/vector-ai-frontend/browser to:
# - Render Static Site
# - Netlify
# - Vercel
# - GitHub Pages
```

### Deployment URLs (After Setup)

| Service | URL |
|---------|-----|
| Backend API | `https://vector-ai-backend.onrender.com` |
| Frontend | `https://vector-ai-frontend.onrender.com` |

> ⚠️ **Free Plan Note**: Services spin down after 15 minutes of inactivity. First request after idle may take 30-60 seconds.

## 📚 How It Works

### Document Indexing Flow

```
PDF Upload → Text Extraction → Chunking → Embedding → Vector Store
```

1. **Upload**: PDF file uploaded via multipart form
2. **Extract**: pdf-parse extracts text content
3. **Chunk**: Text split into 300-char overlapping chunks
4. **Embed**: Generate embeddings (OpenAI or local model)
5. **Store**: Save chunks + embeddings in memory

### Question Answering Flow

```
Question → Embed → Vector Search → Context → LLM → Answer
```

1. **Question**: User submits natural language question
2. **Embed**: Generate embedding for question
3. **Search**: Find similar chunks via cosine similarity
4. **Context**: Assemble relevant text passages
5. **Generate**: LLM creates answer from context

## 🧪 Testing

### Using Sample Questions (Recommended) 🎯

1. **Upload the sample document:**
   - Drag & drop `samples/sample-document.txt` into the upload area
   - Or use the PDF version created from `samples/sample-document.html`

2. **Try the built-in sample questions:**
   - Click the **"Sample Questions"** button in the Ask Questions section
   - Browse questions by difficulty (Easy, Medium, Complex)
   - Click any question to auto-fill and search

3. **See more questions:** Check `samples/SAMPLE_QUESTIONS.md` for 30+ test questions

### Using Postman

Import the collection from `postman/Vector-AI.postman_collection.json`

### Using cURL

```bash
# Health check
curl http://localhost:3000/health

# Upload document
curl -X POST http://localhost:3000/api/documents/upload \
  -F "document=@sample.pdf"

# Search
curl -X POST http://localhost:3000/api/search/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Summarize the document"}'
```

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Express.js | REST API framework |
| OpenAI SDK | Embeddings & chat |
| Transformers.js | Local embeddings |
| pdf-parse | PDF text extraction |
| Multer | File upload handling |

### Frontend
| Technology | Purpose |
|------------|---------|
| Angular 17 | Web framework |
| TypeScript | Type safety |
| RxJS | Reactive programming |
| CSS Variables | Theming |

## 📝 Notes

- **In-Memory Storage**: Documents are lost on server restart. For production, consider:
  - PostgreSQL + pgvector
  - Pinecone
  - Weaviate
  - Chroma

- **First Startup**: Local mode downloads ~80MB embedding model (one-time)

- **Supported Files**: PDF and TXT files (max 5MB, configurable via `MAX_FILE_SIZE`)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>Vector AI</strong> - Intelligent Document Search & Q&A
  <br>
  Built with ❤️ using Node.js, Angular, and AI
</p>
