import express from 'express';
import fs from 'fs';
import { upload } from '../middleware/upload.js';
import { indexDocument, vectorStore } from '../services/vector.service.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * POST /api/documents/upload
 * Upload a PDF document and index it for vector search
 */
router.post('/upload', upload.single('document'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded. Please upload a PDF file.', 400);
    }

    console.log(`Processing uploaded file: ${req.file.originalname}`);
    
    // Index the document
    const result = await indexDocument(req.file.path, req.file.originalname);
    
    res.status(201).json({
      success: true,
      message: 'Document uploaded and indexed successfully',
      data: result,
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

/**
 * GET /api/documents
 * List all indexed documents
 */
router.get('/', (req, res) => {
  const documents = vectorStore.getAllDocuments();
  
  res.json({
    success: true,
    data: {
      total: documents.length,
      documents,
    },
  });
});

/**
 * GET /api/documents/:id
 * Get a specific document by ID
 */
router.get('/:id', (req, res, next) => {
  try {
    const document = vectorStore.getDocument(req.params.id);
    
    if (!document) {
      throw new AppError('Document not found', 404);
    }
    
    res.json({
      success: true,
      data: {
        id: req.params.id,
        filename: document.metadata.originalName,
        totalChunks: document.chunks.length,
        metadata: document.metadata,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/documents/:id
 * Delete a document from the vector store and remove the uploaded file
 */
router.delete('/:id', (req, res, next) => {
  try {
    // Get document info before deleting (to get the filename)
    const document = vectorStore.getDocument(req.params.id);
    
    if (!document) {
      throw new AppError('Document not found', 404);
    }
    
    // Delete from vector store
    vectorStore.deleteDocument(req.params.id);
    
    // Try to delete the uploaded file from filesystem
    const filePath = `uploads/${document.metadata.filename}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
    
    res.json({
      success: true,
      message: 'Document deleted successfully',
      data: {
        deletedDocumentId: req.params.id,
        deletedFile: document.metadata.originalName,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

