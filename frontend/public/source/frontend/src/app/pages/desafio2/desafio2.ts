import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Movimentacao, Produto, TipoMovimentacao, mensagemErro } from '../../core/api.service';

@Component({
  selector: 'app-desafio2',
  imports: [DatePipe, FormsModule],
  template: `
    <section class="page">
      <div class="page-head">
        <span class="eyebrow">Desafio 2</span>
        <h1>Movimentação de <span class="grad-text">estoque</span></h1>
        <p>Lance entradas e saídas. Cada movimentação recebe um <strong>ID único</strong>, uma <strong>descrição</strong> e retorna a <strong>quantidade final</strong> do produto.</p>
      </div>

      <div class="grid cols-2">
        <div class="stack">
          <div class="card">
            <h3>📦 Nova movimentação</h3>
            <div class="stack">
              <div>
                <label for="mov-produto">Produto</label>
                <select id="mov-produto" [(ngModel)]="codigo">
                  @for (p of produtos(); track p.codigoProduto) { <option [ngValue]="p.codigoProduto">{{ p.codigoProduto }} · {{ p.descricaoProduto }}</option> }
                </select>
              </div>
              <div>
                <label>Tipo</label>
                <div class="seg" role="group">
                  <button id="tipo-entrada" type="button" [class.on-in]="tipo() === 'Entrada'" (click)="tipo.set('Entrada')">⬇ Entrada</button>
                  <button id="tipo-saida" type="button" [class.on-out]="tipo() === 'Saida'" (click)="tipo.set('Saida')">⬆ Saída</button>
                </div>
              </div>
              <div class="form-grid">
                <div><label for="mov-qtd">Quantidade</label><input id="mov-qtd" type="number" min="1" step="1" [(ngModel)]="quantidade"></div>
                <div><label for="mov-desc">Descrição</label><input id="mov-desc" [(ngModel)]="descricao" placeholder="Ex.: Recebimento NF 1234"></div>
              </div>
              @if (erro()) { <div class="alert err">{{ erro() }}</div> }
              @if (ultima(); as u) {
                <div class="alert ok">
                  <strong>{{ u.id }}</strong> registrada — {{ u.descricaoProduto }}:
                  {{ u.estoqueAnterior }} → <strong>{{ u.estoqueFinal }}</strong> unidades em estoque.
                </div>
              }
              <div class="row">
                <button id="btn-movimentar" class="btn" (click)="movimentar()" [disabled]="enviando() || !quantidade || quantidade < 1 || !descricao.trim()">Lançar movimentação</button>
                <button id="btn-resetar" class="btn ghost" (click)="resetar()">Restaurar JSON original</button>
              </div>
            </div>
          </div>

          <div class="card">
            <h3>Estoque atual</h3>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Cód.</th><th>Produto</th><th class="num">Qtde</th><th>Nível</th></tr></thead>
                <tbody>
                  @for (p of produtos(); track p.codigoProduto) {
                    <tr>
                      <td>{{ p.codigoProduto }}</td><td>{{ p.descricaoProduto }}</td>
                      <td class="num"><strong>{{ p.estoque }}</strong></td>
                      <td><span class="badge" [class.danger]="p.estoque < 50" [class.warn]="p.estoque >= 50 && p.estoque < 100" [class.ok]="p.estoque >= 100">{{ p.estoque < 50 ? 'Crítico' : p.estoque < 100 ? 'Atenção' : 'Normal' }}</span></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>🕒 Histórico de movimentações</h3>
          @if (historico().length === 0) { <p>Nenhuma movimentação ainda. Lance a primeira ao lado.</p> }
          <ul class="timeline scroll-y" style="max-height: 640px">
            @for (m of historico(); track m.id) {
              <li [class.in]="m.tipo === 'Entrada'" [class.out]="m.tipo === 'Saida'">
                <div class="row between">
                  <strong>{{ m.id }}</strong>
                  <span class="badge" [class.ok]="m.tipo === 'Entrada'" [class.danger]="m.tipo === 'Saida'">{{ m.tipo === 'Entrada' ? '+' : '−' }}{{ m.quantidade }}</span>
                </div>
                <div style="font-size: .9rem">{{ m.descricaoProduto }} — <em>{{ m.descricao }}</em></div>
                <div style="font-size: .78rem; color: var(--muted)">{{ m.estoqueAnterior }} → {{ m.estoqueFinal }} · {{ m.dataHora | date: 'dd/MM/yyyy HH:mm:ss' }}</div>
              </li>
            }
          </ul>
        </div>
      </div>
    </section>
  `
})
export class Desafio2 implements OnInit {
  private api = inject(ApiService);

  protected produtos = signal<Produto[]>([]);
  protected historico = signal<Movimentacao[]>([]);
  protected ultima = signal<Movimentacao | null>(null);
  protected erro = signal('');
  protected enviando = signal(false);
  protected tipo = signal<TipoMovimentacao>('Entrada');
  protected codigo = 101;
  protected quantidade: number | null = 10;
  protected descricao = '';

  ngOnInit(): void { this.atualizar(); }

  private atualizar(): void {
    this.api.estoque().subscribe({
      next: p => { this.produtos.set(p); if (p.length && !p.some(x => x.codigoProduto === this.codigo)) this.codigo = p[0].codigoProduto; },
      error: e => this.erro.set(mensagemErro(e))
    });
    this.api.historico().subscribe({ next: h => this.historico.set(h), error: () => {} });
  }

  protected movimentar(): void {
    if (!this.quantidade) return;
    this.enviando.set(true);
    this.erro.set('');
    this.api.movimentar({ codigoProduto: this.codigo, tipo: this.tipo(), quantidade: this.quantidade, descricao: this.descricao }).subscribe({
      next: r => { this.ultima.set(r.movimentacao); this.descricao = ''; this.enviando.set(false); this.atualizar(); },
      error: e => { this.erro.set(mensagemErro(e)); this.ultima.set(null); this.enviando.set(false); }
    });
  }

  protected resetar(): void {
    this.api.resetarEstoque().subscribe({
      next: () => { this.ultima.set(null); this.erro.set(''); this.atualizar(); },
      error: e => this.erro.set(mensagemErro(e))
    });
  }
}
