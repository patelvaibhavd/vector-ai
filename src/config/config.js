import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  port: parseInt(process.env.PORT || '3000', 10),
  
  // Embedding Provider: 'openai' or 'local'
  embeddingProvider: process.env.EMBEDDING_PROVIDER || 'openai',
  
  // OpenAI Configuration
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiEmbeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
  openaiChatModel: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
  
  // Vector Search Configuration
  chunkSize: parseInt(process.env.CHUNK_SIZE || '300', 10), // Smaller chunks for more specific results
  chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '30', 10),
  topKResults: parseInt(process.env.TOP_K_RESULTS || '1', 10), // Default to 1 for most specific result
  similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD || '0.3'), // Minimum similarity score
  
  // Upload Configuration
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
};

// Validate configuration
export function validateConfig() {
  if (config.embeddingProvider === 'openai') {
    if (!config.openaiApiKey) {
      console.error('❌ OPENAI_API_KEY is required when using OpenAI provider');
      console.log('   Set it in your .env file or use EMBEDDING_PROVIDER=local for local embeddings');
      process.exit(1);
    }
    console.log('✅ Using OpenAI for embeddings and answer generation');
    console.log(`   Embedding model: ${config.openaiEmbeddingModel}`);
    console.log(`   Chat model: ${config.openaiChatModel}`);
  } else {
    console.log('✅ Using local embedding model - no API keys required!');
  }
}
