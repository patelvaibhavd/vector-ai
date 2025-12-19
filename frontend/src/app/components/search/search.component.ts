import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { SearchResult, SearchSource } from '../../models/search.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-container">
      <!-- Search Form -->
      <form (ngSubmit)="onSearch()" class="search-form">
        <div class="search-input-wrapper">
          <textarea
            [(ngModel)]="question"
            name="question"
            class="search-input"
            placeholder="Ask a question about your documents..."
            rows="3"
            [disabled]="isSearching"
            (keydown)="onKeyDown($event)">
          </textarea>
          <button 
            type="submit" 
            class="search-btn btn btn-primary"
            [disabled]="!question.trim() || isSearching">
            @if (isSearching) {
              <div class="spinner"></div>
              <span>Searching...</span>
            } @else {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span>Search</span>
            }
          </button>
        </div>
        
        <p class="search-hint">Press Ctrl+Enter to search</p>
      </form>

      @if (errorMessage) {
        <div class="alert alert-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-icon">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
      }

      <!-- Search Results -->
      @if (searchResult) {
        <div class="results-container animate-fade-in">
          <!-- Answer Section -->
          <div class="result-section answer-section">
            <div class="result-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="result-icon">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <h3>Answer</h3>
            </div>
            <div class="answer-content">
              <p>{{ searchResult.answer }}</p>
            </div>
          </div>

          <!-- Best Match Section -->
          @if (searchResult.bestMatch) {
            <div class="result-section match-section">
              <div class="result-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="result-icon">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <h3>Best Match</h3>
                <span class="similarity-badge">{{ searchResult.bestMatch.similarity }}</span>
              </div>
              <div class="match-content">
                <p class="match-text">{{ searchResult.bestMatch.text }}</p>
                <p class="match-source">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                  {{ searchResult.bestMatch.document }}
                </p>
              </div>
            </div>
          }

          <!-- Sources Section -->
          @if (searchResult.sources && searchResult.sources.length > 0) {
            <div class="result-section sources-section">
              <div class="result-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="result-icon">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                <h3>Sources</h3>
              </div>
              <div class="sources-list">
                @for (source of searchResult.sources; track source.documentId) {
                  <div class="source-card">
                    <div class="source-header">
                      <span class="source-name">{{ source.documentName }}</span>
                      <span class="badge badge-info">{{ source.similarity }}</span>
                    </div>
                    <p class="source-text">{{ source.text }}</p>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      @if (!searchResult && !errorMessage && !isSearching) {
        <div class="search-placeholder">
          <div class="placeholder-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <p class="placeholder-text">Ask anything about your uploaded documents</p>
          <p class="placeholder-hint">The AI will find relevant information and provide an answer</p>
        </div>
      }

      <!-- Sample Questions Section -->
      <div class="sample-section">
        <button 
          class="sample-toggle"
          (click)="showSamples = !showSamples"
          [class.active]="showSamples">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sample-icon">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
          <span>Sample Questions</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
               class="chevron" [class.rotated]="showSamples">
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </button>

        @if (showSamples) {
          <div class="sample-content animate-fade-in">
            <div class="sample-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>
                Download and upload &nbsp;
                <a href="assets/samples/sample-document.txt" 
                   download="sample-document.txt" 
                   class="sample-download-link">
                  sample-document.txt
                </a>
                &nbsp;to test these questions
              </span>
            </div>

            <div class="sample-categories">
              <!-- Easy Questions -->
              <div class="sample-category">
                <h4 class="category-title easy">
                  <span class="category-dot"></span>
                  Easy Questions
                </h4>
                <div class="sample-list">
                  @for (q of sampleQuestions.easy; track q) {
                    <button class="sample-question" (click)="useSampleQuestion(q)">
                      <span>{{ q }}</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12,5 19,12 12,19"/>
                      </svg>
                    </button>
                  }
                </div>
              </div>

              <!-- Medium Questions -->
              <div class="sample-category">
                <h4 class="category-title medium">
                  <span class="category-dot"></span>
                  Medium Questions
                </h4>
                <div class="sample-list">
                  @for (q of sampleQuestions.medium; track q) {
                    <button class="sample-question" (click)="useSampleQuestion(q)">
                      <span>{{ q }}</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12,5 19,12 12,19"/>
                      </svg>
                    </button>
                  }
                </div>
              </div>

              <!-- Complex Questions -->
              <div class="sample-category">
                <h4 class="category-title complex">
                  <span class="category-dot"></span>
                  Complex Questions
                </h4>
                <div class="sample-list">
                  @for (q of sampleQuestions.complex; track q) {
                    <button class="sample-question" (click)="useSampleQuestion(q)">
                      <span>{{ q }}</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12,5 19,12 12,19"/>
                      </svg>
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      height: 100%;
    }

    .search-form {
      margin-bottom: 1.5rem;
    }

    .search-input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .search-input {
      width: 100%;
      padding: 1rem;
      font-family: inherit;
      font-size: 1rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      color: var(--text-primary);
      resize: none;
      transition: all var(--transition-fast);
    }

    .search-input:focus {
      outline: none;
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    .search-input::placeholder {
      color: var(--text-muted);
    }

    .search-btn {
      align-self: flex-end;
      min-width: 130px;
    }

    .search-btn svg {
      width: 18px;
      height: 18px;
    }

    .search-hint {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin: 0.25rem 0 0 0.5rem;
    }

    .search-placeholder {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--bg-card);
      border-radius: var(--border-radius-lg);
      border: 1px dashed var(--border-color);
    }

    .placeholder-icon {
      width: 72px;
      height: 72px;
      margin: 0 auto 1.5rem;
      color: var(--text-muted);
      opacity: 0.5;
    }

    .placeholder-icon svg {
      width: 100%;
      height: 100%;
    }

    .placeholder-text {
      font-size: 1.1rem;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }

    .placeholder-hint {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin: 0;
    }

    .results-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .result-section {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      overflow: hidden;
    }

    .result-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: var(--bg-tertiary);
      border-bottom: 1px solid var(--border-color);
    }

    .result-header h3 {
      font-size: 0.95rem;
      font-weight: 600;
      margin: 0;
      flex: 1;
    }

    .result-icon {
      width: 20px;
      height: 20px;
      color: var(--accent-primary);
    }

    .similarity-badge {
      padding: 0.25rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 600;
      background: var(--accent-gradient);
      color: white;
      border-radius: 50px;
    }

    .answer-content {
      padding: 1.25rem;
    }

    .answer-content p {
      font-size: 1rem;
      line-height: 1.7;
      color: var(--text-primary);
      margin: 0;
      white-space: pre-wrap;
    }

    .match-content {
      padding: 1.25rem;
    }

    .match-text {
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--text-secondary);
      margin-bottom: 1rem;
      padding: 1rem;
      background: var(--bg-tertiary);
      border-radius: var(--border-radius);
      border-left: 3px solid var(--accent-primary);
    }

    .match-source {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--text-muted);
      margin: 0;
    }

    .match-source svg {
      width: 16px;
      height: 16px;
    }

    .sources-list {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .source-card {
      padding: 1rem;
      background: var(--bg-tertiary);
      border-radius: var(--border-radius);
      border: 1px solid var(--border-color);
    }

    .source-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .source-name {
      font-weight: 500;
      font-size: 0.9rem;
      color: var(--text-primary);
    }

    .source-text {
      font-size: 0.9rem;
      line-height: 1.6;
      color: var(--text-secondary);
      margin: 0;
    }

    .alert-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    /* Sample Questions Section */
    .sample-section {
      margin-top: 1.5rem;
      border-top: 1px solid var(--border-color);
      padding-top: 1.5rem;
    }

    .sample-toggle {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.875rem 1rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      color: var(--text-secondary);
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .sample-toggle:hover {
      background: var(--bg-hover);
      border-color: var(--accent-primary);
      color: var(--text-primary);
    }

    .sample-toggle.active {
      background: var(--bg-tertiary);
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }

    .sample-icon {
      width: 20px;
      height: 20px;
      color: var(--accent-secondary);
    }

    .sample-toggle span {
      flex: 1;
      text-align: left;
    }

    .chevron {
      width: 18px;
      height: 18px;
      transition: transform var(--transition-fast);
    }

    .chevron.rotated {
      transform: rotate(180deg);
    }

    .sample-content {
      margin-top: 1rem;
    }

    .sample-hint {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: var(--border-radius);
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 1.25rem;
    }

    .sample-hint svg {
      width: 18px;
      height: 18px;
      color: var(--accent-primary);
      flex-shrink: 0;
      margin-top: 2px;
    }

    .sample-download-link {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.1rem 0.3rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--accent-primary);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.85rem;
      transition: all var(--transition-fast);
    }

    .sample-download-link:hover {
      background: var(--accent-primary);
      color: white;
      border-color: var(--accent-primary);
    }

    .sample-download-link svg {
      width: 14px;
      height: 14px;
    }

    .sample-categories {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .sample-category {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      overflow: hidden;
    }

    .category-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      padding: 0.75rem 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: var(--bg-tertiary);
      border-bottom: 1px solid var(--border-color);
    }

    .category-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .category-title.easy {
      color: var(--success);
    }

    .category-title.easy .category-dot {
      background: var(--success);
    }

    .category-title.medium {
      color: var(--warning);
    }

    .category-title.medium .category-dot {
      background: var(--warning);
    }

    .category-title.complex {
      color: var(--accent-secondary);
    }

    .category-title.complex .category-dot {
      background: var(--accent-secondary);
    }

    .sample-list {
      display: flex;
      flex-direction: column;
    }

    .sample-question {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      width: 100%;
      padding: 0.875rem 1rem;
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--border-color);
      color: var(--text-secondary);
      font-size: 0.9rem;
      text-align: left;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .sample-question:last-child {
      border-bottom: none;
    }

    .sample-question:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .sample-question:hover svg {
      transform: translateX(4px);
      color: var(--accent-primary);
    }

    .sample-question svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      transition: all var(--transition-fast);
      opacity: 0.5;
    }
  `]
})
export class SearchComponent {
  question = '';
  searchResult: SearchResult | null = null;
  isSearching = false;
  errorMessage = '';
  showSamples = false;

  // Sample questions based on sample-document.txt
  sampleQuestions = {
    easy: [
      'When was TechVision Innovations founded?',
      'Where is the company headquarters located?',
      'What was the total revenue in 2024?',
      'How many employees does the company have?',
      'What is the name of the flagship product?'
    ],
    medium: [
      'What are the three main product lines offered by TechVision?',
      'How much did the company invest in R&D in 2024?',
      'What is the expected revenue growth for 2025?',
      'What sustainability goals has the company set for 2030?',
      'What are the key features of the NeuroAssist platform?'
    ],
    complex: [
      'How does the company\'s R&D investment relate to its revenue?',
      'Compare the three main product categories and their features',
      'What is the company\'s strategy for environmental sustainability?',
      'What are all the AI and machine learning capabilities mentioned?',
      'Summarize the company\'s 2025 projections and growth plans'
    ]
  };

  constructor(private apiService: ApiService) {}

  useSampleQuestion(question: string): void {
    this.question = question;
    this.showSamples = false;
    // Scroll to top of search container
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      this.onSearch();
    }
  }

  onSearch(): void {
    if (!this.question.trim() || this.isSearching) return;

    this.isSearching = true;
    this.errorMessage = '';
    this.searchResult = null;

    this.apiService.search({ question: this.question.trim() }).subscribe({
      next: (response) => {
        this.searchResult = response.data;
        this.isSearching = false;
      },
      error: (error: Error) => {
        this.errorMessage = this.getErrorMessage(error);
        this.isSearching = false;
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
    return 'Search failed. Please try again.';
  }
}

