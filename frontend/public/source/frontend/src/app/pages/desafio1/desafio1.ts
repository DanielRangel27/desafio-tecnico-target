import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, RelatorioComissao, Venda, mensagemErro } from '../../core/api.service';

@Component({
  selector: 'app-desafio1',
  imports: [CurrencyPipe, DecimalPipe, FormsModule],
  template: `
    <section class="page">
      <div class="page-head">
        <span class="eyebrow">Desafio 1</span>
        <h1>Comissão de <span class="grad-text">vendas</span></h1>
        <p>Cada venda: abaixo de R$ 100 não gera comissão · abaixo de R$ 500 gera <strong>1%</strong> · a partir de R$ 500 gera <strong>5%</strong>.</p>
      </div>

      @if (erro()) { <div class="alert err" style="margin-bottom: 1rem">{{ erro() }}</div> }
      @if (carregando()) { <p><span class="spinner"></span> Calculando na API C#…</p> }

      @if (rel(); as r) {
        <div class="grid cols-4" style="margin-bottom: 1.4rem">
          <div class="card kpi"><div class="label">Total vendido</div><div class="value">{{ r.totalVendido | currency: 'BRL' }}</div><div class="sub">{{ r.detalhes.length }} vendas</div></div>
          <div class="card kpi"><div class="label">Total de comissões</div><div class="value grad-text">{{ r.totalComissao | currency: 'BRL' }}</div><div class="sub">{{ percentualGeral() | number: '1.2-2' }}% do vendido</div></div>
          <div class="card kpi"><div class="label">Ticket médio</div><div class="value">{{ ticketMedio() | currency: 'BRL' }}</div><div class="sub">por venda</div></div>
          <div class="card kpi"><div class="label">Top comissão</div><div class="value" style="font-size: 1.4rem">{{ r.vendedores[0].vendedor }}</div><div class="sub">{{ r.vendedores[0].totalComissao | currency: 'BRL' }}</div></div>
        </div>

        <div class="grid cols-2" style="margin-bottom: 1.4rem">
          <div class="card">
            <h3>Comissão por vendedor</h3>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Vendedor</th><th class="num">Vendas</th><th class="num">Total vendido</th><th class="num">Comissão</th><th class="num">Efetivo</th></tr></thead>
                <tbody>
                  @for (v of r.vendedores; track v.vendedor) {
                    <tr>
                      <td><strong>{{ v.vendedor }}</strong></td>
                      <td class="num">{{ v.quantidadeVendas }}</td>
                      <td class="num">{{ v.totalVendido | currency: 'BRL' }}</td>
                      <td class="num"><strong>{{ v.totalComissao | currency: 'BRL' }}</strong></td>
                      <td class="num"><span class="badge info">{{ v.percentualEfetivo | number: '1.2-2' }}%</span></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <div class="card">
            <h3>Vendas × comissão</h3>
            <div class="stack">
              @for (v of r.vendedores; track v.vendedor) {
                <div>
                  <div class="row between" style="font-size: .85rem"><span>{{ v.vendedor }}</span><span style="color: var(--muted)">{{ v.totalComissao | currency: 'BRL' }}</span></div>
                  <div class="bar-track" title="Total vendido"><div class="bar-fill" [style.width.%]="(v.totalVendido / maxVendido()) * 100"></div></div>
                  <div class="bar-track" style="margin-top: 4px; height: 6px" title="Comissão"><div class="bar-fill warm" [style.width.%]="(v.totalComissao / maxComissao()) * 100"></div></div>
                </div>
              }
              <div class="row" style="font-size: .75rem; color: var(--muted)">
                <span><span class="badge info">▬</span> vendido</span><span><span class="badge danger">▬</span> comissão</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom: 1.4rem">
          <div class="row between">
            <h3>Detalhe por venda</h3>
            <select id="filtro-vendedor" style="width: auto" [ngModel]="filtro()" (ngModelChange)="filtro.set($event)">
              <option value="">Todos os vendedores</option>
              @for (v of r.vendedores; track v.vendedor) { <option [value]="v.vendedor">{{ v.vendedor }}</option> }
            </select>
          </div>
          <div class="table-wrap scroll-y">
            <table>
              <thead><tr><th>Vendedor</th><th class="num">Valor</th><th class="num">Faixa</th><th class="num">Comissão</th></tr></thead>
              <tbody>
                @for (d of detalhesFiltrados(); track $index) {
                  <tr>
                    <td>{{ d.vendedor }}</td>
                    <td class="num">{{ d.valor | currency: 'BRL' }}</td>
                    <td class="num"><span class="badge" [class.muted]="d.percentualComissao === 0" [class.warn]="d.percentualComissao === 1" [class.ok]="d.percentualComissao === 5">{{ d.percentualComissao }}%</span></td>
                    <td class="num">{{ d.comissao | currency: 'BRL' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <div class="card">
        <h3>➕ Simulador: adicione vendas e recalcule</h3>
        <div class="form-grid">
          <div><label for="novo-vendedor">Vendedor</label><input id="novo-vendedor" [(ngModel)]="novoVendedor" placeholder="Nome do vendedor"></div>
          <div><label for="novo-valor">Valor (R$)</label><input id="novo-valor" type="number" min="0" step="0.01" [(ngModel)]="novoValor"></div>
          <div class="row">
            <button id="btn-add-venda" class="btn" (click)="adicionar()" [disabled]="!novoVendedor.trim() || novoValor == null || novoValor < 0">Adicionar</button>
            <button id="btn-reset-vendas" class="btn ghost" (click)="carregar()">Voltar ao JSON do desafio</button>
          </div>
        </div>
      </div>
    </section>
  `
})
export class Desafio1 implements OnInit {
  private api = inject(ApiService);

  protected rel = signal<RelatorioComissao | null>(null);
  protected carregando = signal(false);
  protected erro = signal('');
  protected filtro = signal('');
  protected novoVendedor = '';
  protected novoValor: number | null = null;

  protected detalhesFiltrados = computed(() => {
    const r = this.rel();
    const f = this.filtro();
    return r ? r.detalhes.filter(d => !f || d.vendedor === f) : [];
  });
  protected maxVendido = computed(() => Math.max(1, ...(this.rel()?.vendedores.map(v => v.totalVendido) ?? [1])));
  protected maxComissao = computed(() => Math.max(1, ...(this.rel()?.vendedores.map(v => v.totalComissao) ?? [1])));
  protected ticketMedio = computed(() => {
    const r = this.rel();
    return r && r.detalhes.length ? r.totalVendido / r.detalhes.length : 0;
  });
  protected percentualGeral = computed(() => {
    const r = this.rel();
    return r && r.totalVendido ? (r.totalComissao / r.totalVendido) * 100 : 0;
  });

  ngOnInit(): void { this.carregar(); }

  protected carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.api.comissoesPadrao().subscribe({
      next: r => { this.rel.set(r); this.carregando.set(false); },
      error: e => { this.erro.set(mensagemErro(e)); this.carregando.set(false); }
    });
  }

  protected adicionar(): void {
    const r = this.rel();
    if (!r || this.novoValor == null) return;
    const vendas: Venda[] = [...r.detalhes.map(d => ({ vendedor: d.vendedor, valor: d.valor })),
      { vendedor: this.novoVendedor.trim(), valor: this.novoValor }];
    this.carregando.set(true);
    this.api.calcularComissoes(vendas).subscribe({
      next: nr => { this.rel.set(nr); this.carregando.set(false); this.novoVendedor = ''; this.novoValor = null; },
      error: e => { this.erro.set(mensagemErro(e)); this.carregando.set(false); }
    });
  }
}
