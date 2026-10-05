// Copia os arquivos-fonte do projeto para public/source e gera manifest.json,
// que alimenta a aba "Código" do site. Execute: npm run sync-sources
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const frontend = resolve(here, '..');
const repo = resolve(frontend, '..');
const out = join(frontend, 'public', 'source');

const grupos = [
  { grupo: 'Backend · C# (.NET 8)', arquivos: [
    'backend/TargetDesafio.Api/Program.cs',
    'backend/TargetDesafio.Api/Models/Dtos.cs',
    'backend/TargetDesafio.Api/Services/ComissaoService.cs',
    'backend/TargetDesafio.Api/Services/EstoqueService.cs',
    'backend/TargetDesafio.Api/Services/JurosService.cs',
    'backend/TargetDesafio.Api/Controllers/DesafiosController.cs',
    'backend/TargetDesafio.Api/TargetDesafio.Api.csproj',
    'backend/Dockerfile'
  ]},
  { grupo: 'Testes · xUnit', arquivos: ['backend/TargetDesafio.Tests/DesafiosTests.cs'] },
  { grupo: 'Frontend · Angular', arquivos: [
    'frontend/src/app/app.ts',
    'frontend/src/app/app.routes.ts',
    'frontend/src/app/core/api.service.ts',
    'frontend/src/app/core/perfil.ts',
    'frontend/src/app/pages/apresentacao/apresentacao.ts',
    'frontend/src/app/pages/desafio1/desafio1.ts',
    'frontend/src/app/pages/desafio2/desafio2.ts',
    'frontend/src/app/pages/desafio3/desafio3.ts',
    'frontend/src/app/pages/codigo/codigo.ts',
    'frontend/src/environments/environment.ts',
    'frontend/src/styles.css',
    'frontend/vercel.json'
  ]},
  { grupo: 'Documentação', arquivos: ['plan.md'] }
];

rmSync(out, { recursive: true, force: true });
const manifest = [];
for (const g of grupos) {
  const items = [];
  for (const rel of g.arquivos) {
    const src = join(repo, rel);
    if (!existsSync(src)) { console.warn('ignorado (não existe):', rel); continue; }
    const dest = join(out, rel);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(src, dest);
    items.push({ caminho: rel, linhas: readFileSync(src, 'utf8').split('\n').length });
  }
  manifest.push({ grupo: g.grupo, arquivos: items });
}
writeFileSync(join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Sincronizados ${manifest.reduce((n, g) => n + g.arquivos.length, 0)} arquivos em public/source`);
