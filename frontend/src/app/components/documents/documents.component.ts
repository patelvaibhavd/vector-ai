import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Document } from '../../models/document.model';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="documents-container">
      @if (isLoading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <span>Loading documents...</span>
        </div>
      } @else if (documents.length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
          </div>
          <p class="empty-text">No documents uploaded yet</p>
          <p class="empty-hint">Upload a PDF or TXT file to get started</p>
        </div>
      } @else {
        <div class="documents-list">
          @for (doc of documents; track doc.id) {
            <div class="document-card" [class.deleting]="deletingId === doc.id">
              <div class="doc-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              
              <div class="doc-info">
                <h4 class="doc-name" [title]="doc.originalName">{{ doc.originalName }}</h4>
                <div class="doc-meta">
                  <span class="badge badge-info">{{ doc.totalChunks }} chunks</span>
                  <span class="doc-id" [title]="doc.id">{{ doc.id | slice:0:8 }}...</span>
                </div>
              </div>

              <div class="doc-actions">
                <a 
                  class="action-btn download-btn"
                  [href]="getDownloadUrl(doc.id)"
                  download
                  title="Download document">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </a>
                <button 
                  class="action-btn delete-btn"
                  (click)="deleteDocument(doc.id)"
                  [disabled]="deletingId === doc.id"
                  title="Delete document">
                  @if (deletingId === doc.id) {
                    <div class="spinner"></div>
                  } @else {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  }
                </button>
              </div>
            </div>
          }
        </div>
      }

      @if (errorMessage) {
        <div class="alert alert-error mt-2">
          <span>{{ errorMessage }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .documents-container {
      min-height: 200px;
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 3rem;
      color: var(--text-muted);
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      background: var(--bg-card);
      border-radius: var(--border-radius-lg);
      border: 1px dashed var(--border-color);
    }

    .empty-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 1rem;
      color: var(--text-muted);
      opacity: 0.5;
    }

    .empty-icon svg {
      width: 100%;
      height: 100%;
    }

    .empty-text {
      font-size: 1.1rem;
      color: var(--text-secondary);
      margin-bottom: 0.25rem;
    }

    .empty-hint {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin: 0;
    }

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .document-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      transition: all var(--transition-fast);
    }

    .document-card:hover {
      border-color: var(--accent-primary);
      background: var(--bg-hover);
    }

    .document-card.deleting {
      opacity: 0.5;
    }

    .doc-icon {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      background: rgba(99, 102, 241, 0.1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent-primary);
    }

    .doc-icon svg {
      width: 20px;
      height: 20px;
    }

    .doc-info {
      flex: 1;
      min-width: 0;
    }

    .doc-name {
      font-size: 0.95rem;
      font-weight: 500;
      margin: 0 0 0.35rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .doc-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .doc-id {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .doc-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .action-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 8px;
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);
      text-decoration: none;
    }

    .action-btn svg {
      width: 18px;
      height: 18px;
    }

    .download-btn:hover {
      background: rgba(99, 102, 241, 0.1);
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }

    .delete-btn:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.1);
      border-color: var(--error);
      color: var(--error);
    }

    .delete-btn:disabled {
      cursor: wait;
    }

    .action-btn .spinner {
      width: 16px;
      height: 16px;
    }
  `]
})
export class DocumentsComponent implements OnInit, OnChanges {
  @Input() refreshTrigger = 0;
  @Output() documentDeleted = new EventEmitter<void>();

  documents: Document[] = [];
  isLoading = false;
  deletingId: string | null = null;
  errorMessage = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  getDownloadUrl(id: string): string {
    return this.apiService.getDownloadUrl(id);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshTrigger'] && !changes['refreshTrigger'].firstChange) {
      this.loadDocuments();
    }
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getDocuments().subscribe({
      next: (response) => {
        this.documents = response.data.documents;
        this.isLoading = false;
      },
      error: (error: Error) => {
        this.errorMessage = this.getErrorMessage(error);
        this.isLoading = false;
      }
    });
  }

  deleteDocument(id: string): void {
    if (this.deletingId) return;
    
    this.deletingId = id;
    this.errorMessage = '';

    this.apiService.deleteDocument(id).subscribe({
      next: () => {
        this.documents = this.documents.filter(doc => doc.id !== id);
        this.deletingId = null;
        this.documentDeleted.emit();
      },
      error: (error: Error) => {
        this.errorMessage = this.getErrorMessage(error);
        this.deletingId = null;
      }
    });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>;
      if (typeof err['message'] === 'string') return err['message'];
      if (typeof err['error'] === 'string') return err['error'];
    }
    return 'An error occurred. Please try again.';
  }
}

