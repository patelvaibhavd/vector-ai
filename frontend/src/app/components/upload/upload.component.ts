import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="upload-container">
      <div 
        class="upload-zone"
        [class.dragover]="isDragOver"
        [class.uploading]="isUploading"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()">
        
        <input 
          #fileInput
          type="file"
          accept=".pdf,.txt"
          (change)="onFileSelected($event)"
          hidden>

        @if (isUploading) {
          <div class="upload-progress">
            <div class="spinner-large"></div>
            <p class="upload-status">Processing document...</p>
            <p class="upload-filename">{{ selectedFileName }}</p>
          </div>
        } @else {
          <div class="upload-content">
            <div class="upload-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M7 18a4.6 4.4 0 0 1 0-9h.5A6.5 6.3 0 0 1 19 10a4.6 4.4 0 0 1 1 8.7"/>
                <path d="M12 13v9"/>
                <path d="M8 17l4-4 4 4"/>
              </svg>
            </div>
            <p class="upload-text">
              <span class="highlight">Click to upload</span> or drag and drop
            </p>
            <p class="upload-hint">PDF or TXT files (max 5MB)</p>
          </div>
        }
      </div>

      @if (successMessage) {
        <div class="alert alert-success mt-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-icon">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
          <div>
            <strong>{{ successMessage }}</strong>
            @if (uploadDetails) {
              <p class="alert-details">
                {{ uploadDetails.totalChunks }} chunks indexed · {{ uploadDetails.totalCharacters | number }} characters
              </p>
            }
          </div>
        </div>
      }

      @if (errorMessage) {
        <div class="alert alert-error mt-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-icon">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .upload-zone {
      border: 2px dashed var(--border-color);
      border-radius: var(--border-radius-lg);
      padding: 3rem 2rem;
      text-align: center;
      cursor: pointer;
      transition: all var(--transition-normal);
      background: var(--bg-card);
    }

    .upload-zone:hover,
    .upload-zone.dragover {
      border-color: var(--accent-primary);
      background: rgba(99, 102, 241, 0.05);
    }

    .upload-zone.uploading {
      cursor: wait;
      border-color: var(--accent-secondary);
    }

    .upload-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 1.5rem;
      color: var(--accent-primary);
    }

    .upload-icon svg {
      width: 100%;
      height: 100%;
    }

    .upload-text {
      font-size: 1.1rem;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }

    .upload-text .highlight {
      color: var(--accent-primary);
      font-weight: 600;
    }

    .upload-hint {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin: 0;
    }

    .upload-progress {
      padding: 1rem 0;
    }

    .spinner-large {
      width: 48px;
      height: 48px;
      border: 3px solid var(--border-color);
      border-top-color: var(--accent-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1.5rem;
    }

    .upload-status {
      font-size: 1.1rem;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .upload-filename {
      font-size: 0.9rem;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
      margin: 0;
    }

    .alert-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .alert-details {
      font-size: 0.85rem;
      margin: 0.25rem 0 0 0;
      opacity: 0.8;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class UploadComponent {
  @Output() uploadComplete = new EventEmitter<void>();

  isDragOver = false;
  isUploading = false;
  selectedFileName = '';
  successMessage = '';
  errorMessage = '';
  uploadDetails: { totalChunks: number; totalCharacters: number } | null = null;

  constructor(private apiService: ApiService) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
      input.value = ''; // Reset input
    }
  }

  private handleFile(file: File): void {
    // Clear previous messages
    this.successMessage = '';
    this.errorMessage = '';
    this.uploadDetails = null;

    // Validate file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.pdf') && !fileName.endsWith('.txt')) {
      this.errorMessage = 'Only PDF and TXT files are allowed';
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'File size must be less than 5MB';
      return;
    }

    this.uploadFile(file);
  }

  private uploadFile(file: File): void {
    this.isUploading = true;
    this.selectedFileName = file.name;

    this.apiService.uploadDocument(file).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.successMessage = `${file.name} uploaded successfully!`;
        this.uploadDetails = {
          totalChunks: response.data.totalChunks,
          totalCharacters: response.data.totalCharacters
        };
        this.uploadComplete.emit();

        // Clear success message after 5 seconds
        setTimeout(() => {
          this.successMessage = '';
          this.uploadDetails = null;
        }, 5000);
      },
      error: (error: Error) => {
        this.isUploading = false;
        this.errorMessage = this.getErrorMessage(error);
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
    return 'Failed to upload document. Please try again.';
  }
}

