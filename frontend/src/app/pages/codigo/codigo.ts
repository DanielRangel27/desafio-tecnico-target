import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PERFIL } from '../../core/perfil';

interface Grupo { grupo: string; arquivos: { caminho: string; linhas: number }[]; }

const CS_KW = 'using namespace public private protected internal static readonly class record interface enum new return if else var void string int decimal bool async await null true false switch throw try catch foreach for in is not out ref partial const override virtual abstract sealed get set init this base lock typeof default where and or';
const TS_KW = 'import export from const let var function class interface type extends implements new return if else async await null undefined true false switch throw try catch for of in readonly private protected public static as typeof void this default case break continue';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Realce de sintaxe leve (sem dependências) via tokenização em uma única passada. */
function realcar(code: string, ext: string): string {
  if (!['cs', 'ts', 'css', 'json', 'csproj'].includes(ext) && ext !== 'Dockerfile') return esc(code);
  const kw = new Set((ext === 'cs' ? CS_KW : ext === 'ts' ? TS_KW : '').split(' '));
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?m?\b)|(\b[A-Za-z_][A-Za-z0-9_]*\b)/g;
  let out = '', last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index));
    const [tok, com, str, num, id] = m;
    if (com) out += `<span class="tk-c">${esc(com)}</span>`;
    else if (str) out += `<span class="tk-s">${esc(str)}</span>`;
    else if (num) out += `<span class="tk-n">${esc(num)}</span>`;
    else if (kw.has(id)) out += `<span class="tk-k">${id}</span>`;
    else if (/^[A-Z][A-Za-z0-9]+$/.test(id)) out += `<span class="tk-t">${id}</span>`;
    else out += esc(tok);
    last = m.index + tok.length;
  }
  return out + esc(code.slice(last));
}

@Component({
  selector: 'app-codigo',
  template: `
    <section class="page">
      <div class="page-head">
        <span class="eyebrow">Código-fonte</span>
        <h1>Todo o <span class="grad-text">código</span> deste projeto</h1>
        <p>Navegue pelos arquivos reais do backend em C#, dos testes e do frontend em Angular. Repositório completo no
          <a [href]="github" target="_blank" rel="noopener">GitHub</a>.</p>
      </div>

      <div class="code-shell">
        <aside class="card file-tree" aria-label="Arquivos do projeto">
          @for (g of grupos(); track g.grupo) {
            <h4>{{ g.grupo }}</h4>
            @for (a of g.arquivos; track a.caminho) {
              <button [id]="'file-' + a.caminho" [class.active]="atual() === a.caminho" (click)="abrir(a.caminho)">{{ nome(a.caminho) }}</button>
            }
          }
        </aside>

        <div class="card code-panel">
          <div class="code-bar">
            <span>{{ atual() }}</span>
            <button id="btn-copiar" class="btn ghost sm" (click)="copiar()">{{ copiado() ? '✓ Copiado' : 'Copiar' }}</button>
          </div>
          @if (carregando()) { <p style="padding: 1rem"><span class="spinner"></span> Carregando…</p> }
          <pre class="code"><code [innerHTML]="html()"></code></pre>
        </div>
      </div>
    </section>
  `
})
export class Codigo implements OnInit {
  private http = inject(HttpClient);

  protected github = PERFIL.github;
  protected grupos = signal<Grupo[]>([]);
  protected atual = signal('');
  protected carregando = signal(false);
  protected copiado = signal(false);
  private texto = signal('');
  protected html = computed(() => {
    const caminho = this.atual();
    const ext = caminho.endsWith('Dockerfile') ? 'Dockerfile' : (caminho.split('.').pop() ?? '');
    return realcar(this.texto(), ext);
  });

  ngOnInit(): void {
    this.http.get<Grupo[]>('source/manifest.json').subscribe(g => {
      this.grupos.set(g);
      if (g[0]?.arquivos[0]) this.abrir(g[0].arquivos[0].caminho);
    });
  }

  protected nome(caminho: string): string { return caminho.split('/').pop() ?? caminho; }

  protected abrir(caminho: string): void {
    this.atual.set(caminho);
    this.carregando.set(true);
    this.http.get(`source/${caminho}`, { responseType: 'text' }).subscribe({
      next: t => { this.texto.set(t); this.carregando.set(false); },
      error: () => { this.texto.set('// Não foi possível carregar o arquivo.'); this.carregando.set(false); }
    });
  }

  protected copiar(): void {
    navigator.clipboard.writeText(this.texto()).then(() => {
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 1800);
    });
  }
}
