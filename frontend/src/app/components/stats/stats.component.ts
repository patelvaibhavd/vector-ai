import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { StatsData, ConfigData } from '../../models/search.model';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-container">
      <div class="stats-grid">
        <!-- Total Documents -->
        <div class="stat-card">
          <div class="stat-icon documents-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats?.totalDocuments ?? '—' }}</span>
            <span class="stat-label">Documents</span>
          </div>
        </div>

        <!-- Total Chunks -->
        <div class="stat-card">
          <div class="stat-icon chunks-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats?.totalChunks ?? '—' }}</span>
            <span class="stat-label">Text Chunks</span>
          </div>
        </div>

        <!-- LLM Provider -->
        <div class="stat-card">
          <div class="stat-icon llm-icon" [ngClass]="getProviderClass(config?.llmProvider)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a2 2 0 1 1 0 4h-1v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-1H2a2 2 0 1 1 0-4h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
              <circle cx="8" cy="14" r="1"/>
              <circle cx="16" cy="14" r="1"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ getProviderDisplayName(config?.llmProvider) }}</span>
            <span class="stat-label">LLM Provider</span>
          </div>
        </div>

        <!-- API Status -->
        <div class="stat-card">
          <div class="stat-icon status-icon" [class.online]="isOnline">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ isOnline ? 'Active' : 'Offline' }}</span>
            <span class="stat-label">API Status</span>
          </div>
        </div>

        <!-- Embedding Provider -->
        <div class="stat-card">
          <div class="stat-icon embed-icon" [ngClass]="getProviderClass(config?.embeddingProvider)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="4"/>
              <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/>
              <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/>
              <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/>
              <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ getProviderDisplayName(config?.embeddingProvider) }}</span>
            <span class="stat-label">Embeddings</span>
          </div>
        </div>

        <!-- Refresh Button -->
        <div class="stat-card refresh-card" (click)="refresh()">
          <div class="stat-icon refresh-icon" [class.spinning]="isLoading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 2v6h-6"/>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
              <path d="M3 22v-6h6"/>
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">Refresh</span>
            <span class="stat-label">Update Stats</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-container {
      margin-bottom: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 1rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      transition: all var(--transition-fast);
    }

    .stat-card:hover {
      border-color: rgba(99, 102, 241, 0.3);
    }

    .refresh-card {
      cursor: pointer;
    }

    .refresh-card:hover {
      background: var(--bg-hover);
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
    }

    .stat-icon svg {
      width: 22px;
      height: 22px;
    }

    .documents-icon {
      background: rgba(99, 102, 241, 0.1);
      color: var(--accent-primary);
    }

    .chunks-icon {
      background: rgba(139, 92, 246, 0.1);
      color: var(--accent-secondary);
    }

    .status-icon {
      background: rgba(239, 68, 68, 0.1);
      color: var(--error);
    }

    .status-icon.online {
      background: rgba(16, 185, 129, 0.1);
      color: var(--success);
    }

    .refresh-icon {
      background: rgba(59, 130, 246, 0.1);
      color: var(--info);
    }

    .refresh-icon.spinning svg {
      animation: spin 1s linear infinite;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .stat-value {
      font-size: 1.35rem;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .stat-label {
      font-size: 0.8rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Provider-specific colors */
    .llm-icon, .embed-icon {
      background: rgba(96, 96, 112, 0.1);
      color: var(--text-muted);
    }

    .llm-icon.groq, .embed-icon.groq {
      background: rgba(249, 115, 22, 0.1);
      color: #f97316;
    }

    .llm-icon.gemini, .embed-icon.gemini {
      background: rgba(66, 133, 244, 0.1);
      color: #4285f4;
    }

    .llm-icon.openai, .embed-icon.openai {
      background: rgba(16, 163, 127, 0.1);
      color: #10a37f;
    }

    .llm-icon.local, .embed-icon.local {
      background: rgba(168, 85, 247, 0.1);
      color: #a855f7;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 1024px) {
      .stats-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StatsComponent implements OnInit, OnChanges {
  @Input() refreshTrigger = 0;
  @Output() refreshStats = new EventEmitter<void>();

  stats: StatsData | null = null;
  config: ConfigData | null = null;
  isLoading = false;
  isOnline = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshTrigger'] && !changes['refreshTrigger'].firstChange) {
      this.loadStats();
    }
  }

  loadStats(): void {
    this.isLoading = true;

    this.apiService.getStats().subscribe({
      next: (response) => {
        this.stats = response.data;
        this.isOnline = true;
        this.isLoading = false;
      },
      error: () => {
        this.isOnline = false;
        this.isLoading = false;
      }
    });
  }

  loadConfig(): void {
    this.apiService.getConfig().subscribe({
      next: (response) => {
        this.config = response.data;
      },
      error: () => {
        // Config failed to load, will show default values
      }
    });
  }

  getProviderDisplayName(provider: string | undefined): string {
    if (!provider) return '—';
    const names: Record<string, string> = {
      'openai': 'OpenAI',
      'groq': 'Groq',
      'gemini': 'Gemini',
      'local': 'Local'
    };
    return names[provider.toLowerCase()] || provider;
  }

  getProviderClass(provider: string | undefined): string {
    if (!provider) return '';
    return provider.toLowerCase();
  }

  refresh(): void {
    this.loadStats();
    this.loadConfig();
    this.refreshStats.emit();
  }
}

