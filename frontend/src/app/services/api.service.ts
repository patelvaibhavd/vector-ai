import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  DocumentListResponse, 
  DocumentDetailResponse, 
  UploadResponse, 
  DeleteResponse 
} from '../models/document.model';
import { 
  SearchQuery, 
  SearchResponse, 
  StatsResponse, 
  HealthResponse,
  ConfigResponse 
} from '../models/search.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      // Network error - server not reachable
      errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
    } else {
      // Server-side error - handle various formats
      const serverError = error.error;
      if (typeof serverError === 'string') {
        errorMessage = serverError;
      } else if (serverError?.error && typeof serverError.error === 'string') {
        errorMessage = serverError.error;
      } else if (serverError?.message && typeof serverError.message === 'string') {
        errorMessage = serverError.message;
      } else if (serverError?.error?.message) {
        errorMessage = serverError.error.message;
      } else {
        errorMessage = `Server error (${error.status}): ${error.statusText || 'Unknown error'}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  // Health check
  checkHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/health`)
      .pipe(catchError(this.handleError));
  }

  // Document operations
  getDocuments(): Observable<DocumentListResponse> {
    return this.http.get<DocumentListResponse>(`${this.baseUrl}/api/documents`)
      .pipe(catchError(this.handleError));
  }

  getDocument(id: string): Observable<DocumentDetailResponse> {
    return this.http.get<DocumentDetailResponse>(`${this.baseUrl}/api/documents/${id}`)
      .pipe(catchError(this.handleError));
  }

  uploadDocument(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('document', file);
    
    return this.http.post<UploadResponse>(`${this.baseUrl}/api/documents/upload`, formData)
      .pipe(catchError(this.handleError));
  }

  deleteDocument(id: string): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.baseUrl}/api/documents/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Get download URL for a document
  getDownloadUrl(id: string): string {
    return `${this.baseUrl}/api/documents/${id}/download`;
  }

  // Search operations
  search(query: SearchQuery): Observable<SearchResponse> {
    return this.http.post<SearchResponse>(`${this.baseUrl}/api/search/query`, query)
      .pipe(catchError(this.handleError));
  }

  getStats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.baseUrl}/api/search/stats`)
      .pipe(catchError(this.handleError));
  }

  // Get configuration info (providers)
  getConfig(): Observable<ConfigResponse> {
    return this.http.get<ConfigResponse>(`${this.baseUrl}/api/config`)
      .pipe(catchError(this.handleError));
  }
}

