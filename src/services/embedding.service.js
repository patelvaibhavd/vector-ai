import { pipeline } from '@xenova/transformers';
import OpenAI from 'openai';
import { config } from '../config/config.js';
import { AppError } from '../middleware/errorHandler.js';

// Local embedding pipeline (lazy loaded)
let localEmbeddingPipeline = null;

// API clients (lazy initialized)
let openaiClient = null;
let groqClient = null;

/**
 * Get OpenAI client instance
 */
function getOpenAIClient() {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: config.openaiApiKey,
    });
  }
  return openaiClient;
}

/**
 * Get Groq client instance (OpenAI-compatible API)
 */
function getGroqClient() {
  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey: config.groqApiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return groqClient;
}

/**
 * Initialize the local embedding pipeline (lazy loading)
 * Uses all-MiniLM-L6-v2 - a small, fast, and effective embedding model
 */
async function getLocalEmbeddingPipeline() {
  if (!localEmbeddingPipeline) {
    console.log('🔄 Loading local embedding model (first time may take a minute)...');
    localEmbeddingPipeline = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
    console.log('✅ Local embedding model loaded successfully!');
  }
  return localEmbeddingPipeline;
}

/**
 * Generate embedding using OpenAI
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
async function generateOpenAIEmbedding(text) {
  const client = getOpenAIClient();
  const response = await client.embeddings.create({
    model: config.openaiEmbeddingModel,
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts using OpenAI
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
async function generateOpenAIEmbeddings(texts) {
  const client = getOpenAIClient();
  
  // OpenAI supports batch embedding
  const response = await client.embeddings.create({
    model: config.openaiEmbeddingModel,
    input: texts,
  });
  
  // Sort by index to ensure correct order
  const sortedData = response.data.sort((a, b) => a.index - b.index);
  return sortedData.map(item => item.embedding);
}

/**
 * Generate embedding using local model
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
async function generateLocalEmbedding(text) {
  const extractor = await getLocalEmbeddingPipeline();
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

/**
 * Generate embeddings for multiple texts using local model
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
async function generateLocalEmbeddings(texts) {
  const extractor = await getLocalEmbeddingPipeline();
  const embeddings = [];
  
  for (let i = 0; i < texts.length; i++) {
    const output = await extractor(texts[i], { pooling: 'mean', normalize: true });
    embeddings.push(Array.from(output.data));
    
    if (texts.length > 5 && (i + 1) % 5 === 0) {
      console.log(`  Embedded ${i + 1}/${texts.length} chunks...`);
    }
  }
  
  return embeddings;
}

/**
 * Generate embeddings for a single text
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
export async function generateEmbedding(text) {
  try {
    if (config.embeddingProvider === 'openai') {
      return await generateOpenAIEmbedding(text);
    } else {
      return await generateLocalEmbedding(text);
    }
  } catch (error) {
    throw new AppError(`Embedding error: ${error.message}`, 500);
  }
}

/**
 * Generate embeddings for multiple texts
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
export async function generateEmbeddings(texts) {
  try {
    if (config.embeddingProvider === 'openai') {
      // OpenAI has a limit on tokens per request, batch if needed
      const BATCH_SIZE = 100;
      const allEmbeddings = [];
      
      for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        const batch = texts.slice(i, i + BATCH_SIZE);
        const batchEmbeddings = await generateOpenAIEmbeddings(batch);
        allEmbeddings.push(...batchEmbeddings);
        
        if (texts.length > BATCH_SIZE) {
          console.log(`  Embedded ${Math.min(i + BATCH_SIZE, texts.length)}/${texts.length} chunks...`);
        }
      }
      
      return allEmbeddings;
    } else {
      return await generateLocalEmbeddings(texts);
    }
  } catch (error) {
    // Provide helpful error messages for common OpenAI errors
    const errorMessage = getReadableErrorMessage(error);
    throw new AppError(errorMessage, 500);
  }
}

/**
 * Convert OpenAI errors to user-friendly messages
 */
function getReadableErrorMessage(error) {
  const message = error.message || '';
  const code = error.code || error.error?.code || '';
  
  if (code === 'insufficient_quota' || message.includes('quota')) {
    return 'OpenAI quota exceeded. Please add credits at https://platform.openai.com/settings/organization/billing';
  }
  if (code === 'invalid_api_key' || message.includes('invalid') && message.includes('key')) {
    return 'Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env file';
  }
  if (message.includes('Connection error') || message.includes('ENOTFOUND')) {
    return 'Cannot connect to OpenAI API. Check your internet connection or try again later';
  }
  if (code === 'rate_limit_exceeded') {
    return 'OpenAI rate limit exceeded. Please wait a moment and try again';
  }
  
  return `Embedding error: ${message}`;
}

/**
 * Generate an answer using the configured LLM provider
 * Supports: OpenAI, Groq (FREE), Gemini (FREE), or local extractive
 * @param {string} question - User's question
 * @param {string[]} relevantChunks - Relevant document chunks
 * @returns {Promise<string>} - Generated answer
 */
export async function generateAnswer(question, relevantChunks) {
  if (relevantChunks.length === 0) {
    return 'No relevant information found in the documents.';
  }

  const llmProvider = config.llmProvider;

  try {
    switch (llmProvider) {
      case 'openai':
        return await generateOpenAIAnswer(question, relevantChunks);
      case 'groq':
        return await generateGroqAnswer(question, relevantChunks);
      case 'gemini':
        return await generateGeminiAnswer(question, relevantChunks);
      default:
        return generateExtractiveAnswer(question, relevantChunks);
    }
  } catch (error) {
    console.error(`${llmProvider} answer generation failed:`, error.message);
    // Fallback to extractive answer
    return generateExtractiveAnswer(question, relevantChunks);
  }
}

/**
 * Build the system prompt for LLMs
 */
function getSystemPrompt() {
  return `You are a helpful assistant that answers questions based on the provided document context. 
Answer the question using ONLY the information from the provided context. 
If the context doesn't contain enough information to answer the question, say so.
Be concise and accurate. Cite source numbers when referencing specific information.`;
}

/**
 * Build the context from chunks
 */
function buildContext(relevantChunks) {
  return relevantChunks
    .map((chunk, index) => `[Source ${index + 1}]\n${chunk}`)
    .join('\n\n');
}

/**
 * Generate answer using OpenAI GPT
 */
async function generateOpenAIAnswer(question, relevantChunks) {
  const client = getOpenAIClient();
  const context = buildContext(relevantChunks);

  const response = await client.chat.completions.create({
    model: config.openaiChatModel,
    messages: [
      { role: 'system', content: getSystemPrompt() },
      { role: 'user', content: `Context from documents:\n\n${context}\n\nQuestion: ${question}` },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });

  return response.choices[0].message.content;
}

/**
 * Generate answer using Groq (FREE - Llama, Mixtral models)
 * Sign up at: https://console.groq.com
 */
async function generateGroqAnswer(question, relevantChunks) {
  const client = getGroqClient();
  const context = buildContext(relevantChunks);

  const response = await client.chat.completions.create({
    model: config.groqChatModel,
    messages: [
      { role: 'system', content: getSystemPrompt() },
      { role: 'user', content: `Context from documents:\n\n${context}\n\nQuestion: ${question}` },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });

  return response.choices[0].message.content;
}

/**
 * Generate answer using Google Gemini (FREE tier available)
 * Sign up at: https://makersuite.google.com/app/apikey
 */
async function generateGeminiAnswer(question, relevantChunks) {
  const context = buildContext(relevantChunks);
  
  const prompt = `${getSystemPrompt()}

Context from documents:

${context}

Question: ${question}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiChatModel}:generateContent?key=${config.geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Gemini API error');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate answer';
}

/**
 * Generate simple extractive answer (no LLM - completely FREE)
 * @param {string} question - User's question
 * @param {string[]} relevantChunks - Relevant document chunks
 * @returns {string} - Most relevant excerpt
 */
function generateExtractiveAnswer(question, relevantChunks) {
  // For single result, return directly without formatting
  if (relevantChunks.length === 1) {
    return relevantChunks[0].trim();
  }
  
  // For multiple results, return concise format
  if (relevantChunks.length <= 2) {
    return relevantChunks.map(chunk => chunk.trim()).join('\n\n');
  }
  
  // For more results, add minimal formatting
  return relevantChunks
    .map((chunk, index) => `[${index + 1}] ${chunk.trim()}`)
    .join('\n\n');
}
