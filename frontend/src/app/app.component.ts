import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadComponent } from './components/upload/upload.component';
import { DocumentsComponent } from './components/documents/documents.component';
import { SearchComponent } from './components/search/search.component';
import { StatsComponent } from './components/stats/stats.component';
import { ApiService } from './services/api.service';
import { ThemeService } from './services/theme.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    UploadComponent,
    DocumentsComponent,
    SearchComponent,
    StatsComponent,
  ],
  template: `
    <div class="app-container">
      <!-- Header -->
      <header class="header">
        <div class="container">
          <div class="header-content">
            <div class="logo">
              <div class="logo-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div class="logo-text">
                <h1>Vector<span class="text-gradient">AI</span></h1>
                <p class="tagline">Intelligent Document Search</p>
              </div>
            </div>

            <div class="header-actions">
              <!-- Theme Toggle Button -->
              <button
                class="theme-toggle"
                (click)="toggleTheme()"
                [attr.aria-label]="
                  themeService.theme() === 'dark'
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
                "
                title="{{
                  themeService.theme() === 'dark'
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
                }}"
              >
                @if (themeService.theme() === 'dark') {
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="theme-icon"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
                } @else {
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="theme-icon"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                }
              </button>

              <!-- Connection Status -->
              <div
                class="status-indicator"
                [class.online]="isServerOnline"
                [class.offline]="!isServerOnline"
              >
                <span class="status-dot"></span>
                <span class="status-text">{{
                  isServerOnline ? "Connected" : "Offline"
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <div class="container">
          <!-- Stats Section -->
          <section
            class="section stats-section animate-fade-in"
            style="animation-delay: 0.1s"
          >
            <app-stats
              [refreshTrigger]="statsRefreshTrigger"
              (refreshStats)="onRefreshStats()"
            ></app-stats>
          </section>

          <!-- Grid Layout -->
          <div class="main-grid">
            <!-- Left Column - Upload & Documents -->
            <div class="left-column">
              <section
                class="section upload-section animate-fade-in"
                style="animation-delay: 0.2s"
              >
                <div class="section-header">
                  <h2>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      class="section-icon"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17,8 12,3 7,8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload Document
                  </h2>
                </div>
                <app-upload (uploadComplete)="onUploadComplete()"></app-upload>
              </section>

              <section
                class="section documents-section animate-fade-in"
                style="animation-delay: 0.3s"
              >
                <div class="section-header">
                  <h2>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      class="section-icon"
                    >
                      <path
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                      />
                      <polyline points="14,2 14,8 20,8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <line x1="10" y1="9" x2="8" y2="9" />
                    </svg>
                    Documents
                  </h2>
                </div>
                <app-documents
                  [refreshTrigger]="documentsRefreshTrigger"
                  (documentDeleted)="onDocumentDeleted($event)"
                >
                </app-documents>
              </section>
            </div>

            <!-- Right Column - Search -->
            <div class="right-column">
              <section
                class="section search-section animate-fade-in"
                style="animation-delay: 0.4s"
              >
                <div class="section-header">
                  <h2>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      class="section-icon"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    Ask Questions
                  </h2>
                </div>
                <app-search></app-search>
              </section>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <p>&copy; 2024 Vector AI - Powered by RAG Technology</p>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .header {
        background: rgba(18, 18, 26, 0.95);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--border-color);
        padding: 1rem 0;
        position: sticky;
        top: 0;
        z-index: 100;
      }

      .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .logo {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .logo-icon {
        width: 48px;
        height: 48px;
        background: var(--accent-gradient);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--accent-glow);
      }

      .logo-icon svg {
        width: 28px;
        height: 28px;
        color: white;
      }

      .logo-text h1 {
        color: #f0f0f5;
        font-size: 1.75rem;
        font-weight: 700;
        margin: 0;
        line-height: 1.2;
      }

      .tagline {
        font-size: 0.85rem;
        color: var(--text-muted);
        margin: 0;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .theme-toggle {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-tertiary);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        cursor: pointer;
        transition: all var(--transition-normal);
        color: var(--text-secondary);
      }

      .theme-toggle:hover {
        background: var(--bg-hover);
        border-color: var(--accent-primary);
        color: var(--accent-primary);
        transform: rotate(15deg);
      }

      .theme-icon {
        width: 22px;
        height: 22px;
      }

      .status-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 50px;
        font-size: 0.85rem;
        font-weight: 500;
      }

      .status-indicator.online {
        background: rgba(16, 185, 129, 0.1);
        color: var(--success);
      }

      .status-indicator.offline {
        background: rgba(239, 68, 68, 0.1);
        color: var(--error);
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }

      .online .status-dot {
        background: var(--success);
      }

      .offline .status-dot {
        background: var(--error);
      }

      .main-content {
        flex: 1;
        padding: 2rem 0;
      }

      .section {
        margin-bottom: 2rem;
      }

      .section-header {
        margin-bottom: 1.25rem;
      }

      .section-header h2 {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
      }

      .section-icon {
        width: 24px;
        height: 24px;
        color: var(--accent-primary);
      }

      .main-grid {
        display: grid;
        grid-template-columns: 1fr 1.2fr;
        gap: 2rem;
      }

      .left-column {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .stats-section {
        margin-bottom: 1rem;
      }

      .footer {
        background: var(--bg-secondary);
        border-top: 1px solid var(--border-color);
        padding: 1.5rem 0;
        text-align: center;
      }

      .footer p {
        color: var(--text-muted);
        font-size: 0.9rem;
        margin: 0;
      }

      @media (max-width: 1024px) {
        .main-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        .header-content {
          flex-direction: column;
          gap: 1rem;
        }

        .logo-text h1 {
          font-size: 1.5rem;
        }
      }
    `,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  isServerOnline = false;
  documentsRefreshTrigger = 0;
  statsRefreshTrigger = 0;
  private healthCheckSub?: Subscription;

  constructor(
    private apiService: ApiService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.checkServerHealth();
    // Check health every 30 seconds
    this.healthCheckSub = interval(30000).subscribe(() => {
      this.checkServerHealth();
    });
  }

  ngOnDestroy(): void {
    this.healthCheckSub?.unsubscribe();
  }

  private checkServerHealth(): void {
    this.apiService.checkHealth().subscribe({
      next: (response) => {
        this.isServerOnline = response.status === "ok";
      },
      error: () => {
        this.isServerOnline = false;
      },
    });
  }

  onUploadComplete(): void {
    this.documentsRefreshTrigger++;
    this.statsRefreshTrigger++;
  }

  onDocumentDeleted(event: void): void {
    this.documentsRefreshTrigger++;
    this.statsRefreshTrigger++;
  }

  onRefreshStats(): void {
    this.statsRefreshTrigger++;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}

