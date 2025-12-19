export interface SearchQuery {
  question: string;
  documentId?: string;
  topK?: number;
  minSimilarity?: number;
}

export interface SearchSource {
  documentId: string;
  documentName: string;
  text: string;
  similarity: string;
}

export interface BestMatch {
  text: string;
  similarity: string;
  document: string;
}

export interface SearchResult {
  answer: string;
  bestMatch: BestMatch;
  sources: SearchSource[];
  question: string;
}

export interface SearchResponse {
  success: boolean;
  data: SearchResult;
}

export interface StatsDocument {
  id: string;
  name: string;
  chunks: number;
}

export interface StatsData {
  totalDocuments: number;
  totalChunks: number;
  documents: StatsDocument[];
}

export interface StatsResponse {
  success: boolean;
  data: StatsData;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
}

export interface ConfigData {
  embeddingProvider: string;
  llmProvider: string;
  models: {
    embedding: string;
    llm: string;
  };
}

export interface ConfigResponse {
  success: boolean;
  data: ConfigData;
}

