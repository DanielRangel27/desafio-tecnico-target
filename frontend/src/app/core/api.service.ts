import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Venda { vendedor: string; valor: number; }
export interface VendaComissao { vendedor: string; valor: number; percentualComissao: number; comissao: number; }
export interface ComissaoVendedor { vendedor: string; quantidadeVendas: number; totalVendido: number; totalComissao: number; percentualEfetivo: number; }
export interface RelatorioComissao { vendedores: ComissaoVendedor[]; detalhes: VendaComissao[]; totalVendido: number; totalComissao: number; }

export interface Produto { codigoProduto: number; descricaoProduto: string; estoque: number; }
export type TipoMovimentacao = 'Entrada' | 'Saida';
export interface MovimentacaoRequest { codigoProduto: number; tipo: TipoMovimentacao; quantidade: number; descricao: string; }
export interface Movimentacao {
  id: string; codigoProduto: number; descricaoProduto: string; tipo: TipoMovimentacao; quantidade: number;
  descricao: string; estoqueAnterior: number; estoqueFinal: number; dataHora: string;
}
export interface MovimentacaoResponse { movimentacao: Movimentacao; estoqueFinal: number; }

export interface JurosRequest { valor: number; dataVencimento: string; dataCalculo?: string | null; }
export interface JurosResult {
  valorOriginal: number; dataVencimento: string; dataCalculo: string; diasAtraso: number;
  taxaDiariaPercentual: number; taxaTotalPercentual: number; valorJuros: number; valorTotal: number;
  status: string; memorial: string[];
}

export type ApiStatus = 'conectando' | 'online' | 'offline';

/** Extrai uma mensagem amigável de um erro HTTP da API. */
export function mensagemErro(e: unknown): string {
  if (e instanceof HttpErrorResponse) {
    if (e.status === 0) return 'Não foi possível conectar à API. Se ela estiver no plano gratuito do Render, aguarde ~50s e tente de novo.';
    return e.error?.erro ?? `Erro ${e.status}`;
  }
  return 'Erro inesperado.';
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  readonly status = signal<ApiStatus>('conectando');

  /** Verifica a API (também "acorda" o Render). Repete até responder. */
  monitorar(): void {
    const tentar = () =>
      this.http.get(`${this.base}/api/health`).subscribe({
        next: () => this.status.set('online'),
        error: () => {
          this.status.set('offline');
          setTimeout(tentar, 8000);
        }
      });
    tentar();
  }

  comissoesPadrao(): Observable<RelatorioComissao> {
    return this.http.get<RelatorioComissao>(`${this.base}/api/desafios/comissoes/padrao`);
  }
  calcularComissoes(vendas: Venda[]): Observable<RelatorioComissao> {
    return this.http.post<RelatorioComissao>(`${this.base}/api/desafios/comissoes/calcular`, { vendas });
  }

  estoque(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.base}/api/desafios/estoque`);
  }
  historico(): Observable<Movimentacao[]> {
    return this.http.get<Movimentacao[]>(`${this.base}/api/desafios/estoque/historico`);
  }
  movimentar(req: MovimentacaoRequest): Observable<MovimentacaoResponse> {
    return this.http.post<MovimentacaoResponse>(`${this.base}/api/desafios/estoque/movimentar`, req);
  }
  resetarEstoque(): Observable<void> {
    return this.http.post<void>(`${this.base}/api/desafios/estoque/resetar`, {});
  }

  calcularJuros(req: JurosRequest): Observable<JurosResult> {
    return this.http.post<JurosResult>(`${this.base}/api/desafios/juros/calcular`, req);
  }
}
