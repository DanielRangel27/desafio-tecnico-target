import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PERFIL } from '../../core/perfil';

@Component({
  selector: 'app-apresentacao',
  imports: [RouterLink],
  template: `
    <section class="hero page">
      <div>
        <span class="eyebrow">Desafio técnico · {{ p.empresa }}</span>
        <h1>Olá, eu sou <span class="grad-text">{{ p.nome }}</span>.</h1>
        <h2 style="color: var(--muted); font-weight: 500">{{ p.titulo }}</h2>
        <p class="lead">{{ p.resumo }}</p>
        <div class="row" style="margin: 1.4rem 0">
          <a id="cta-d1" class="btn" routerLink="/desafio-1">Ver os desafios →</a>
          <a id="cta-code" class="btn ghost" routerLink="/codigo">&lt;/&gt; Ver o código</a>
        </div>
        <div class="row">
          <a class="chip" [href]="p.github" target="_blank" rel="noopener">GitHub</a>
          <a class="chip" [href]="p.linkedin" target="_blank" rel="noopener">LinkedIn</a>
          <a class="chip" [href]="p.email">E-mail</a>
        </div>
      </div>
      <div class="avatar-wrap" aria-hidden="true"><div class="avatar">{{ p.iniciais }}</div></div>
    </section>

    <section class="page" style="padding-top: 1rem">
      <h2>Stack utilizada</h2>
      <div class="row" style="margin-bottom: 2rem">
        @for (s of p.stack; track s) { <span class="chip">{{ s }}</span> }
      </div>

      <div class="grid cols-3" style="margin-bottom: 2.5rem">
        @for (d of p.destaques; track d.titulo) {
          <article class="card hover">
            <h3><span>{{ d.icone }}</span>{{ d.titulo }}</h3>
            <p style="margin: 0">{{ d.texto }}</p>
          </article>
        }
      </div>

      <h2>Os 3 desafios</h2>
      <div class="grid cols-3" style="margin-bottom: 2.5rem">
        <a class="card hover" routerLink="/desafio-1" style="color: inherit">
          <span class="badge info">Desafio 1</span>
          <h3 style="margin-top: .7rem">Comissão de vendas</h3>
          <p style="margin: 0">Regras escalonadas de 0%, 1% e 5% sobre cada venda, agrupadas por vendedor.</p>
        </a>
        <a class="card hover" routerLink="/desafio-2" style="color: inherit">
          <span class="badge info">Desafio 2</span>
          <h3 style="margin-top: .7rem">Movimentação de estoque</h3>
          <p style="margin: 0">Entradas e saídas com ID único, descrição e saldo final do produto.</p>
        </a>
        <a class="card hover" routerLink="/desafio-3" style="color: inherit">
          <span class="badge info">Desafio 3</span>
          <h3 style="margin-top: .7rem">Juros por atraso</h3>
          <p style="margin: 0">Cálculo de 2,5% ao dia a partir do valor e da data de vencimento.</p>
        </a>
      </div>

      <h2>Arquitetura</h2>
      <div class="card">
        <div class="arch">
          <div class="node"><strong>Angular</strong><br><small style="color: var(--muted)">Vercel</small></div>
          <span class="arrow">⇄ REST/JSON ⇄</span>
          <div class="node"><strong>ASP.NET Core 8 (C#)</strong><br><small style="color: var(--muted)">Render / Railway · Docker</small></div>
        </div>
      </div>
    </section>
  `
})
export class Apresentacao {
  protected readonly p = PERFIL;
}
