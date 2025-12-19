import fs from 'fs';
import pdf from 'pdf-parse';
import { config } from '../config/config.js';

/**
 * Extract text content from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text content
 */
export async function extractTextFromPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

/**
 * Split text into chunks with overlap for better context
 * @param {string} text - The text to split
 * @param {number} chunkSize - Maximum size of each chunk
 * @param {number} overlap - Number of characters to overlap between chunks
 * @returns {string[]} - Array of text chunks
 */
export function splitTextIntoChunks(text, chunkSize = config.chunkSize, overlap = config.chunkOverlap) {
  const chunks = [];
  
  // Clean and normalize text
  const cleanedText = text
    .replace(/\s+/g, ' ')
    .trim();
  
  if (cleanedText.length <= chunkSize) {
    return [cleanedText];
  }

  let startIndex = 0;
  
  while (startIndex < cleanedText.length) {
    let endIndex = startIndex + chunkSize;
    
    // Try to break at sentence boundaries
    if (endIndex < cleanedText.length) {
      const lastPeriod = cleanedText.lastIndexOf('.', endIndex);
      const lastNewline = cleanedText.lastIndexOf('\n', endIndex);
      const lastSpace = cleanedText.lastIndexOf(' ', endIndex);
      
      // Prefer sentence boundary, then paragraph, then word boundary
      if (lastPeriod > startIndex + chunkSize / 2) {
        endIndex = lastPeriod + 1;
      } else if (lastNewline > startIndex + chunkSize / 2) {
        endIndex = lastNewline + 1;
      } else if (lastSpace > startIndex + chunkSize / 2) {
        endIndex = lastSpace + 1;
      }
    }
    
    const chunk = cleanedText.slice(startIndex, endIndex).trim();
    
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    
    // Move start index, accounting for overlap
    startIndex = endIndex - overlap;
    
    // Prevent infinite loop
    if (startIndex >= cleanedText.length - overlap) {
      break;
    }
  }
  
  return chunks;
}

/**
 * Process a PDF file and return chunks
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<{text: string, chunks: string[]}>}
 */
export async function processPdf(filePath) {
  const text = await extractTextFromPdf(filePath);
  const chunks = splitTextIntoChunks(text);
  
  return {
    text,
    chunks,
    metadata: {
      totalCharacters: text.length,
      totalChunks: chunks.length,
      processedAt: new Date().toISOString(),
    },
  };
}

