import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config/config.js';
import documentRoutes from './routes/document.routes.js';
import searchRoutes from './routes/search.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Validate configuration on startup
validateConfig();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'vector-ai'
  });
});

// API Routes
app.use('/api/documents', documentRoutes);
app.use('/api/search', searchRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                    VECTOR AI SERVER                    ║
╠════════════════════════════════════════════════════════╣
║  🚀 Server running on http://localhost:${config.port}            ║
║  📄 Upload PDF:  POST /api/documents/upload            ║
║  🔍 Search:      POST /api/search/query                ║
║  📋 List docs:   GET  /api/documents                   ║
╚════════════════════════════════════════════════════════╝
  `);
});

export default app;

