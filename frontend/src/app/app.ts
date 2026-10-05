import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiService } from './core/api.service';
import { PERFIL } from './core/perfil';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="nav">
      <div class="container nav-inner">
        <a class="brand" routerLink="/" (click)="menu.set(false)">
          <span class="brand-dot">{{ perfil.iniciais }}</span>{{ perfil.nome }}
        </a>

        <nav class="nav-links" [class.open]="menu()" aria-label="Navegação principal">
          <a id="nav-home" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="menu.set(false)">Apresentação</a>
          <a id="nav-d1" routerLink="/desafio-1" routerLinkActive="active" (click)="menu.set(false)">1 · Comissões</a>
          <a id="nav-d2" routerLink="/desafio-2" routerLinkActive="active" (click)="menu.set(false)">2 · Estoque</a>
          <a id="nav-d3" routerLink="/desafio-3" routerLinkActive="active" (click)="menu.set(false)">3 · Juros</a>
          <a id="nav-code" routerLink="/codigo" routerLinkActive="active" (click)="menu.set(false)">&lt;/&gt; Código</a>
        </nav>

        <div class="nav-tools">
          <span class="status" id="api-status" [title]="'API C#: ' + api.status()">
            <span class="dot" [class.ok]="api.status() === 'online'" [class.off]="api.status() === 'offline'"></span>
            <span class="label">
              @switch (api.status()) {
                @case ('online') { API C# online }
                @case ('offline') { Acordando API… }
                @default { Conectando… }
              }
            </span>
          </span>
          <button id="theme-toggle" class="btn ghost sm icon" (click)="alternarTema()" aria-label="Alternar tema">{{ tema() === 'dark' ? '☀️' : '🌙' }}</button>
          <button id="menu-toggle" class="btn ghost sm icon menu-btn" (click)="menu.set(!menu())" aria-label="Abrir menu">☰</button>
        </div>
      </div>
    </header>

    <main class="container"><router-outlet /></main>

    <footer class="footer">
      <div class="container">Desafio Técnico · Target Sistemas — C# .NET 8 + Angular · {{ perfil.nome }}</div>
    </footer>
  `
})
export class App {
  protected readonly api = inject(ApiService);
  protected readonly perfil = PERFIL;
  protected readonly menu = signal(false);
  protected readonly tema = signal<'dark' | 'light'>(
    (typeof localStorage !== 'undefined' && (localStorage.getItem('tema') as 'dark' | 'light')) || 'dark'
  );

  constructor() {
    document.documentElement.dataset['theme'] = this.tema();
    this.api.monitorar();
  }

  protected alternarTema(): void {
    const novo = this.tema() === 'dark' ? 'light' : 'dark';
    this.tema.set(novo);
    document.documentElement.dataset['theme'] = novo;
    localStorage.setItem('tema', novo);
  }
}
