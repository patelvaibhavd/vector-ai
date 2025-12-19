import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  port: parseInt(process.env.PORT || '3000', 10),
  
  // Embedding Provider: 'openai', 'groq', 'gemini', or 'local'
  embeddingProvider: process.env.EMBEDDING_PROVIDER || 'local',
  
  // LLM Provider for answer generation: 'openai', 'groq', 'gemini', or 'local'
  // Defaults to embeddingProvider, but can be set separately
  llmProvider: process.env.LLM_PROVIDER || process.env.EMBEDDING_PROVIDER || 'local',
  
  // OpenAI Configuration
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiEmbeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
  openaiChatModel: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
  
  // Groq Configuration (FREE - https://console.groq.com)
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqChatModel: process.env.GROQ_CHAT_MODEL || 'llama-3.1-8b-instant', // Free, fast model
  
  // Google Gemini Configuration (FREE - https://makersuite.google.com/app/apikey)
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiChatModel: process.env.GEMINI_CHAT_MODEL || 'gemini-1.5-flash', // Free tier available
  
  // Vector Search Configuration
  chunkSize: parseInt(process.env.CHUNK_SIZE || '300', 10), // Smaller chunks for more specific results
  chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '30', 10),
  topKResults: parseInt(process.env.TOP_K_RESULTS || '1', 10), // Default to 1 for most specific result
  similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD || '0.3'), // Minimum similarity score
  
  // Upload Configuration
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB default
};

// Validate configuration
export function validateConfig() {
  const provider = config.embeddingProvider;
  const llmProvider = config.llmProvider;
  
  console.log('\n📋 Configuration Summary:');
  console.log('─'.repeat(50));
  
  // Validate embedding provider
  if (provider === 'openai') {
    if (!config.openaiApiKey) {
      console.error('❌ OPENAI_API_KEY is required when using OpenAI provider');
      console.log('   Set it in your .env file or use EMBEDDING_PROVIDER=local');
      process.exit(1);
    }
    console.log(`✅ Embeddings: OpenAI (${config.openaiEmbeddingModel})`);
  } else {
    console.log('✅ Embeddings: Local (all-MiniLM-L6-v2) - FREE');
  }
  
  // Validate LLM provider
  if (llmProvider === 'openai') {
    if (!config.openaiApiKey) {
      console.error('❌ OPENAI_API_KEY is required when using OpenAI for answers');
      process.exit(1);
    }
    console.log(`✅ LLM: OpenAI (${config.openaiChatModel})`);
  } else if (llmProvider === 'groq') {
    if (!config.groqApiKey) {
      console.error('❌ GROQ_API_KEY is required when using Groq provider');
      console.log('   Get a FREE key at: https://console.groq.com');
      process.exit(1);
    }
    console.log(`✅ LLM: Groq (${config.groqChatModel}) - FREE`);
  } else if (llmProvider === 'gemini') {
    if (!config.geminiApiKey) {
      console.error('❌ GEMINI_API_KEY is required when using Gemini provider');
      console.log('   Get a FREE key at: https://makersuite.google.com/app/apikey');
      process.exit(1);
    }
    console.log(`✅ LLM: Google Gemini (${config.geminiChatModel}) - FREE`);
  } else {
    console.log('✅ LLM: Local (extractive) - FREE');
  }
  
  console.log('─'.repeat(50));
}
