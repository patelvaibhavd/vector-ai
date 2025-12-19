import express from 'express';
import { queryDocuments, vectorStore } from '../services/vector.service.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * POST /api/search/query
 * Query documents using vector search and get AI-generated answer
 * 
 * Body:
 * {
 *   "question": "What is the main topic of the document?",
 *   "documentId": "optional-document-id-to-search-within",
 *   "topK": 1,  // Number of results (default: 1 for specific results)
 *   "minSimilarity": 0.3  // Minimum similarity threshold (0-1)
 * }
 */
router.post('/query', async (req, res, next) => {
  try {
    const { question, documentId, topK, minSimilarity } = req.body;
    
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      throw new AppError('Please provide a valid question', 400);
    }
    
    // Check if specific document exists
    if (documentId) {
      const document = vectorStore.getDocument(documentId);
      if (!document) {
        throw new AppError('Specified document not found', 404);
      }
    }
    
    // Check if any documents are indexed
    const allDocs = vectorStore.getAllDocuments();
    if (allDocs.length === 0) {
      throw new AppError('No documents indexed yet. Please upload a document first.', 400);
    }
    
    console.log(`Processing query: "${question.substring(0, 50)}..."`);
    
    // Query documents with options
    const result = await queryDocuments(question.trim(), {
      documentId,
      topK: topK ? parseInt(topK, 10) : undefined,
      minSimilarity: minSimilarity ? parseFloat(minSimilarity) : undefined,
    });
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/search/stats
 * Get statistics about the vector store
 */
router.get('/stats', (req, res) => {
  const documents = vectorStore.getAllDocuments();
  const totalChunks = documents.reduce((sum, doc) => sum + doc.totalChunks, 0);
  
  res.json({
    success: true,
    data: {
      totalDocuments: documents.length,
      totalChunks,
      documents: documents.map(d => ({
        id: d.id,
        name: d.originalName,
        chunks: d.totalChunks,
      })),
    },
  });
});

export default router;

