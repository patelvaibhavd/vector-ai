import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/config.js';
import { generateEmbedding, generateEmbeddings, generateAnswer } from './embedding.service.js';
import { processDocument } from './pdf.service.js';

/**
 * In-memory vector store
 * In production, you would use a proper vector database like Pinecone, Weaviate, or Chroma
 */
class VectorStore {
  constructor() {
    // documentId -> { metadata, chunks: [{text, embedding}] }
    this.documents = new Map();
  }

  /**
   * Add a document to the vector store
   * @param {string} documentId - Unique document ID
   * @param {object} documentData - Document data with chunks and embeddings
   */
  addDocument(documentId, documentData) {
    this.documents.set(documentId, documentData);
  }

  /**
   * Get a document by ID
   * @param {string} documentId - Document ID
   * @returns {object|null} - Document data or null
   */
  getDocument(documentId) {
    return this.documents.get(documentId) || null;
  }

  /**
   * Get all documents
   * @returns {object[]} - Array of documents
   */
  getAllDocuments() {
    const docs = [];
    for (const [id, data] of this.documents) {
      docs.push({
        id,
        filename: data.metadata.filename,
        originalName: data.metadata.originalName,
        totalChunks: data.chunks.length,
        uploadedAt: data.metadata.uploadedAt,
      });
    }
    return docs;
  }

  /**
   * Delete a document by ID
   * @param {string} documentId - Document ID
   * @returns {boolean} - True if deleted, false if not found
   */
  deleteDocument(documentId) {
    return this.documents.delete(documentId);
  }

  /**
   * Search across all documents or specific document
   * @param {number[]} queryEmbedding - Query embedding vector
   * @param {number} topK - Number of results to return
   * @param {string|null} documentId - Optional document ID to search within
   * @param {number} minSimilarity - Minimum similarity threshold
   * @returns {Array} - Top K results with scores
   */
  search(queryEmbedding, topK = config.topKResults, documentId = null, minSimilarity = config.similarityThreshold) {
    const results = [];

    const documentsToSearch = documentId 
      ? [[documentId, this.documents.get(documentId)]]
      : Array.from(this.documents.entries());

    for (const [docId, docData] of documentsToSearch) {
      if (!docData) continue;

      for (const chunk of docData.chunks) {
        const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
        
        // Only include results above the similarity threshold
        if (similarity >= minSimilarity) {
          results.push({
            documentId: docId,
            documentName: docData.metadata.originalName,
            text: chunk.text,
            chunkIndex: chunk.index,
            similarity,
          });
        }
      }
    }

    // Sort by similarity (highest first) and return top K
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} - Similarity score between -1 and 1
 */
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  
  if (magnitude === 0) return 0;
  
  return dotProduct / magnitude;
}

// Singleton instance of the vector store
export const vectorStore = new VectorStore();

/**
 * Truncate text at word boundary to avoid cutting words in half
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text ending at a word boundary
 */
function truncateAtWordBoundary(text, maxLength = 200) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  // Find the last space before maxLength
  let truncateAt = text.lastIndexOf(' ', maxLength);
  
  // If no space found, try to find any word boundary
  if (truncateAt === -1 || truncateAt < maxLength / 2) {
    truncateAt = maxLength;
  }
  
  return text.substring(0, truncateAt).trim() + '...';
}

/**
 * Process and index a document (PDF or TXT)
 * @param {string} filePath - Path to the document file
 * @param {string} originalName - Original filename
 * @returns {Promise<object>} - Document metadata
 */
export async function indexDocument(filePath, originalName) {
  // Extract text and create chunks
  const { chunks, metadata } = await processDocument(filePath);
  
  if (chunks.length === 0) {
    throw new Error('No text content found in the document');
  }
  
  // Generate embeddings for all chunks
  console.log(`Generating embeddings for ${chunks.length} chunks...`);
  const embeddings = await generateEmbeddings(chunks);
  
  // Create document entry
  const documentId = uuidv4();
  const documentData = {
    metadata: {
      filename: filePath.split('/').pop(),
      originalName,
      uploadedAt: new Date().toISOString(),
      ...metadata,
    },
    chunks: chunks.map((text, index) => ({
      text,
      embedding: embeddings[index],
      index,
    })),
  };
  
  // Add to vector store
  vectorStore.addDocument(documentId, documentData);
  
  console.log(`Document indexed successfully: ${documentId}`);
  
  return {
    documentId,
    filename: originalName,
    totalChunks: chunks.length,
    totalCharacters: metadata.totalCharacters,
  };
}

/**
 * Query documents using vector search
 * @param {string} question - User's question
 * @param {object} options - Query options
 * @param {string|null} options.documentId - Optional document ID to search within
 * @param {number} options.topK - Number of results (default: config.topKResults)
 * @param {number} options.minSimilarity - Minimum similarity threshold
 * @returns {Promise<object>} - Search results and generated answer
 */
export async function queryDocuments(question, options = {}) {
  const { 
    documentId = null, 
    topK = config.topKResults,
    minSimilarity = config.similarityThreshold 
  } = options;
  
  // Generate embedding for the question
  const queryEmbedding = await generateEmbedding(question);
  
  // Search for relevant chunks
  const searchResults = vectorStore.search(queryEmbedding, topK, documentId, minSimilarity);
  
  if (searchResults.length === 0) {
    return {
      answer: 'No relevant information found in the documents.',
      sources: [],
      question,
    };
  }
  
  // Extract text from search results
  const relevantChunks = searchResults.map(r => r.text);
  
  // Generate answer
  const answer = await generateAnswer(question, relevantChunks);
  
  // Get the best match for concise display
  const bestMatch = searchResults[0];
  
  return {
    answer,
    bestMatch: {
      text: truncateAtWordBoundary(bestMatch.text, 300),
      similarity: Math.round(bestMatch.similarity * 100) + '%',
      document: bestMatch.documentName,
    },
    sources: searchResults.map(r => ({
      documentId: r.documentId,
      documentName: r.documentName,
      text: truncateAtWordBoundary(r.text, 200),
      similarity: Math.round(r.similarity * 100) + '%',
    })),
    question,
  };
}

