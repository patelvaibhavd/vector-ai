export interface Document {
  id: string;
  originalName: string;
  filename: string;
  totalChunks: number;
  metadata?: DocumentMetadata;
}

export interface DocumentMetadata {
  filename: string;
  originalName: string;
  totalChunks: number;
  totalCharacters: number;
  indexedAt: string;
}

export interface DocumentListResponse {
  success: boolean;
  data: {
    total: number;
    documents: Document[];
  };
}

export interface DocumentDetailResponse {
  success: boolean;
  data: {
    id: string;
    filename: string;
    totalChunks: number;
    metadata: DocumentMetadata;
  };
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    documentId: string;
    filename: string;
    totalChunks: number;
    totalCharacters: number;
  };
}

export interface DeleteResponse {
  success: boolean;
  message: string;
  data: {
    deletedDocumentId: string;
    deletedFile: string;
  };
}

