import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, JurosResult, mensagemErro } from '../../core/api.service';

function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

@Component({
  selector: 'app-desafio3',
  imports: [CurrencyPipe, DecimalPipe, FormsModule],
  template: `
    <section class="page">
      <div class="page-head">
        <span class="eyebrow">Desafio 3</span>
        <h1>Juros por <span class="grad-text">atraso</span></h1>
        <p>A partir de um valor e de uma data de vencimento, calcula os juros até hoje com <strong>2,5% ao dia</strong> de atraso.</p>
      </div>

      <div class="grid cols-2">
        <div class="card">
          <h3>🧮 Simulador</h3>
          <div class="stack">
            <div><label for="juros-valor">Valor (R$)</label><input id="juros-valor" type="number" min="0.01" step="0.01" [(ngModel)]="valor"></div>
            <div><label for="juros-venc">Data de vencimento</label><input id="juros-venc" type="date" [(ngModel)]="vencimento"></div>
            <div>
              <label for="juros-calc">Data do cálculo <span style="font-weight: 400">(padrão: hoje)</span></label>
              <input id="juros-calc" type="date" [(ngModel)]="dataCalculo">
            </div>
            @if (erro()) { <div class="alert err">{{ erro() }}</div> }
            <div class="row">
              <button id="btn-calcular" class="btn" (click)="calcular()" [disabled]="carregando() || !valor || valor <= 0 || !vencimento">Calcular juros</button>
              <button id="btn-hoje" class="btn ghost" (click)="dataCalculo = hoje">Usar hoje</button>
            </div>
          </div>
        </div>

        <div class="card">
          @if (res(); as r) {
            <div class="row between">
              <h3>Resultado</h3>
              <span class="badge" [class.ok]="r.diasAtraso === 0" [class.danger]="r.diasAtraso > 0">{{ r.status }}</span>
            </div>
            <div class="grid cols-2" style="margin-bottom: 1rem">
              <div><div class="label" style="font-size: .75rem; color: var(--muted)">DIAS DE ATRASO</div><div class="big-number">{{ r.diasAtraso }}</div></div>
              <div><div class="label" style="font-size: .75rem; color: var(--muted)">TAXA ACUMULADA</div><div class="big-number">{{ r.taxaTotalPercentual | number: '1.0-2' }}%</div></div>
              <div><div class="label" style="font-size: .75rem; color: var(--muted)">JUROS</div><div class="big-number grad-text">{{ r.valorJuros | currency: 'BRL' }}</div></div>
              <div><div class="label" style="font-size: .75rem; color: var(--muted)">TOTAL A PAGAR</div><div class="big-number">{{ r.valorTotal | currency: 'BRL' }}</div></div>
            </div>
            <h3 style="margin-top: 1.2rem">Memorial de cálculo</h3>
            <ol class="memorial">
              @for (l of r.memorial; track $index) { <li>{{ l }}</li> }
            </ol>
          } @else {
            <h3>Resultado</h3>
            <p>Preencha os dados e clique em <strong>Calcular juros</strong>. O memorial passo a passo aparece aqui.</p>
            @if (carregando()) { <p><span class="spinner"></span> Calculando na API C#…</p> }
          }
        </div>
      </div>
    </section>
  `
})
export class Desafio3 {
  private api = inject(ApiService);

  protected readonly hoje = hojeISO();
  protected valor: number | null = 1000;
  protected vencimento = (() => { const d = new Date(); d.setDate(d.getDate() - 5); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
  protected dataCalculo = '';

  protected res = signal<JurosResult | null>(null);
  protected erro = signal('');
  protected carregando = signal(false);

  protected calcular(): void {
    if (!this.valor) return;
    this.carregando.set(true);
    this.erro.set('');
    this.api.calcularJuros({ valor: this.valor, dataVencimento: this.vencimento, dataCalculo: this.dataCalculo || null }).subscribe({
      next: r => { this.res.set(r); this.carregando.set(false); },
      error: e => { this.erro.set(mensagemErro(e)); this.carregando.set(false); }
    });
  }
}
