# Vector AI Frontend

Angular frontend for Vector AI - an intelligent PDF document search and question-answering system.

## 🚀 Features

- **Modern UI**: Dark theme with neon accents for a sleek developer experience
- **Document Upload**: Drag & drop PDF upload with progress indication
- **Document Management**: View, manage, and delete indexed documents
- **Intelligent Search**: Ask questions and get AI-powered answers
- **Real-time Stats**: Monitor documents, chunks, and API status
- **Responsive Design**: Works seamlessly on desktop and mobile

## 📦 Tech Stack

- **Angular 17** - Modern web framework with standalone components
- **TypeScript** - Type-safe development
- **RxJS** - Reactive programming for API calls
- **CSS Variables** - Consistent theming and dark mode

## 🛠️ Prerequisites

- Node.js 18+
- npm 9+
- Vector AI Backend running (see main README)

## 🏃 Getting Started

### Install Dependencies

```bash
cd frontend
npm install
```

### Development Server

```bash
npm start
```

Navigate to `http://localhost:4200`. The app will automatically reload on code changes.

### Production Build

```bash
npm run build:prod
```

Build artifacts are stored in `dist/vector-ai-frontend/browser`.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── documents/      # Document list & management
│   │   │   ├── search/         # Q&A search interface
│   │   │   ├── stats/          # Statistics dashboard
│   │   │   └── upload/         # PDF upload dropzone
│   │   ├── models/             # TypeScript interfaces
│   │   ├── services/           # API service layer
│   │   └── app.component.ts    # Root component
│   ├── environments/           # Environment configs
│   ├── styles.css              # Global styles
│   ├── index.html              # HTML entry point
│   └── main.ts                 # Bootstrap entry
├── angular.json                # Angular CLI config
├── package.json                # Dependencies
└── tsconfig.json               # TypeScript config
```

## 🎨 UI Components

### Upload Component
- Drag & drop zone for PDF files
- File validation (type & size)
- Upload progress indication
- Success/error notifications

### Documents Component
- List all indexed documents
- Show chunk count per document
- Delete documents with confirmation
- Auto-refresh on upload

### Search Component
- Multi-line question input
- Keyboard shortcut (Ctrl+Enter)
- Displays AI-generated answers
- Shows best match with similarity score
- Lists all relevant sources

### Stats Component
- Total documents count
- Total chunks indexed
- API connection status
- Manual refresh button

## 🔧 Configuration

### Environment Variables

Edit `src/environments/environment.ts` for development:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

Edit `src/environments/environment.prod.ts` for production:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-url.onrender.com'
};
```

## 🚀 Deployment

### Render (Recommended)

The frontend is configured for Render static site hosting in the root `render.yaml`.

1. Push code to GitHub
2. Connect repository to Render
3. Deploy using Blueprint

### Manual Deployment

```bash
# Build production bundle
npm run build:prod

# Deploy dist/vector-ai-frontend/browser to any static host:
# - Netlify
# - Vercel
# - GitHub Pages
# - AWS S3 + CloudFront
```

## 🎯 API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Check API status |
| `/api/documents` | GET | List all documents |
| `/api/documents/upload` | POST | Upload PDF |
| `/api/documents/:id` | DELETE | Delete document |
| `/api/search/query` | POST | Search & ask questions |
| `/api/search/stats` | GET | Get statistics |

## 🎨 Design System

### Color Palette
- Background: `#0a0a0f` (primary), `#12121a` (secondary)
- Accent: `#6366f1` → `#8b5cf6` (gradient)
- Success: `#10b981`
- Error: `#ef4444`

### Typography
- Primary: Outfit (sans-serif)
- Monospace: JetBrains Mono

### Components
- Border radius: 12px (default), 16px (large)
- Transitions: 0.15s (fast), 0.25s (normal)

## 📝 License

MIT

