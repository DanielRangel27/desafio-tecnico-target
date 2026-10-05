# 📋 Plano de Desenvolvimento: Desafio Técnico Target Sistemas
**Fullstack: C# (.NET 8 Web API) + Angular (Frontend) | Deploy: Render/Railway + Vercel**

---

## 📌 1. Visão Geral do Projeto

Este projeto consiste em uma aplicação web fullstack desenvolvida com foco em excelência técnica, código limpo e arquitetura moderna para apresentação do Desafio Técnico da **Target Sistemas**.

### 🎯 Objetivos Principais:
1. **Página de Apresentação**: Perfil profissional do candidato, motivação, competências técnicas e visão geral da solução.
2. **Desafio 1 (Comissão de Vendas)**: Leitura de dados, cálculo de comissões com faixas escalonadas (0%, 1% e 5%) e exibição analítica.
3. **Desafio 2 (Movimentação de Estoque)**: Gestão de estoque com entradas/saídas, identificador único, histórico e validações de saldo.
4. **Desafio 3 (Cálculo de Juros por Atraso)**: Cálculo dinâmico de juros diários (2,5% ao dia) com memorial de cálculo detalhado.
5. **Showcase de Código & Arquitetura**: Visualizador de código integrado (C# e Angular), documentação OpenAPI/Swagger e links do repositório.

---

## 🏗️ 2. Arquitetura da Solução

```
├── backend/                  # ASP.NET Core 8 Web API
│   ├── Controllers/          # Endpoints REST (Desafios, HealthCheck)
│   ├── Services/             # Regras de negócio e algoritmos dos 3 desafios
│   ├── Models/               # DTOs e entidades de domínio
│   ├── Tests/                # Testes unitários com xUnit e FluentAssertions
│   └── Dockerfile            # Container para deploy no Render / Railway
│
├── frontend/                 # Aplicação Angular 19+ (Standalone Components)
│   ├── src/app/
│   │   ├── core/             # Serviços HTTP, interceptors, estado da API
│   │   ├── shared/           # Componentes reutilizáveis (Navbar, Footer, CodeViewer)
│   │   └── pages/            # Telas principais (Apresentação, Desafio 1, 2, 3, Código)
│   └── vercel.json           # Configuração de roteamento SPA para Vercel
```

### 🚀 Estratégia de Deploy:
- **Backend (C# .NET 8)**: Hospedado no **Render** (Web Service via Docker ou Native .NET) ou **Railway**.
- **Frontend (Angular)**: Hospedado no **Vercel** (Build estático com rewrite SPA para `index.html`).
- **Resiliência (Cold Start)**: Como o Render Free Tier "dorme" após inatividade, o frontend terá um indicador visual de status da API ("🟢 Conectado" / "🟡 Conectando ao Render...") e suporte a fallback de dados para avaliação imediata.

---

## 📝 3. Especificação dos 3 Desafios

### 🔹 Desafio 1: Cálculo de Comissão de Vendas
- **Regras de Negócio**:
  - `Valor < R$ 100,00`: **0% de comissão** (isento).
  - `R$ 100,00 <= Valor < R$ 500,00`: **1% de comissão**.
  - `Valor >= R$ 500,00`: **5% de comissão**.
- **Dados Base**: Lista de 36 vendas distribuídas entre 4 vendedores (*João Silva, Maria Souza, Carlos Oliveira, Ana Lima*).
- **Entregáveis da API C#**:
  - Endpoint `GET /api/desafios/comissoes/padrao`: Processa os dados originais do desafio e retorna totais por vendedor e lista detalhada.
  - Endpoint `POST /api/desafios/comissoes/calcular`: Permite enviar um JSON customizado de vendas e obter o cálculo em tempo real.
- **Entregáveis da UI Angular**:
  - Cards de KPI: Total em Vendas da Equipe, Total de Comissões, Ticket Médio e Top Vendedor.
  - Tabela comparativa por vendedor (Total de Vendas, Qtd Vendas, Comissão Total, Taxa Média).
  - Gráfico visual comparativo (Vendas x Comissões).
  - Modal/Formulário para adicionar novas vendas e recalcular.

---

### 🔹 Desafio 2: Movimentação de Estoque
- **Regras de Negócio**:
  - Produtos base:
    - `101` - Caneta Azul (Estoque inicial: 150)
    - `102` - Caderno Universitário (Estoque inicial: 75)
    - `103` - Borracha Branca (Estoque inicial: 200)
    - `104` - Lápis Preto HB (Estoque inicial: 320)
    - `105` - Marcador de Texto Amarelo (Estoque inicial: 90)
  - Cada movimentação exige:
    - **ID Único**: Identificador exclusivo sequencial ou GUID (ex: `MOV-0001`).
    - **Descrição**: Motivo/tipo da movimentação (ex: *"Recebimento Lote NF 120"*, *"Venda Balcão Pedido #40"*).
    - **Tipo**: `Entrada` (+) ou `Saída` (-).
    - **Quantidade**: Inteiro positivo.
  - **Validação crítica**: Não permitir saída superior ao estoque disponível (lançar erro de domínio 400 amigável).
  - **Retorno**: Quantidade final atualizada do produto movimentado e registro no histórico.
- **Entregáveis da API C#**:
  - `GET /api/desafios/estoque`: Lista todos os produtos e estoques atuais.
  - `POST /api/desafios/estoque/movimentar`: Realiza uma movimentação e retorna o produto atualizado.
  - `GET /api/desafios/estoque/historico`: Lista histórico completo de movimentações.
  - `POST /api/desafios/estoque/resetar`: Restaura os estoques para os valores padrão do desafio.
- **Entregáveis da UI Angular**:
  - Tabela dinâmica de produtos com badges de status de estoque (Alto, Normal, Atenção).
  - Formulário moderno para lançar movimentação com validação instantânea.
  - Linha do tempo / Histórico de movimentações em tempo real.
  - Botão de "Resetar para Padrão".

---

### 🔹 Desafio 3: Cálculo de Juros por Atraso
- **Regras de Negócio**:
  - Entrada: `ValorOriginal` (R$) e `DataVencimento`.
  - Data de cálculo: Data atual (`Hoje`) ou data simulada.
  - Regra de juros: Multa/Juros de **2,5% ao dia** por dia corrido de atraso.
  - Se `Hoje <= DataVencimento`: 0 dias de atraso, juros = R$ 0,00, valor total = `ValorOriginal`.
  - Se `Hoje > DataVencimento`:
    - `DiasAtraso = (Hoje - DataVencimento).Days`
    - `TaxaJurosTotal = DiasAtraso * 0.025` (2,5% por dia)
    - `ValorJuros = ValorOriginal * TaxaJurosTotal`
    - `ValorFinal = ValorOriginal + ValorJuros`
- **Entregáveis da API C#**:
  - `POST /api/desafios/juros/calcular`: Recebe `{ valor, dataVencimento, dataCalculo? }` e retorna o cálculo detalhado com memorial de cálculo.
- **Entregáveis da UI Angular**:
  - Simulador interativo com campo monetário e seletor de datas.
  - Exibição em tempo real: Badge de status (Em dia / Vencido), Dias de Atraso, Percentual Acumulado, Valor dos Juros e Total a Pagar.
  - Tabela passo a passo (Memorial de Cálculo) explicando a decomposição matemática dia a dia.

---

## 💻 4. Estrutura do Código e Showcase

### 🔹 Apresentação & Perfil
- Foto/Avatar com efeito glassmorphism moderno.
- Bio objetiva, links para LinkedIn, GitHub, Currículo e Contato.
- Visão geral da arquitetura do projeto e tecnologias utilizadas.

### 🔹 Visualizador de Código Embutido (Showcase)
- Componente com abas para visualização de:
  - **C#**: `ComissaoService.cs`, `EstoqueService.cs`, `JurosService.cs`.
  - **C# Tests**: Testes unitários xUnit com cobertura das regras.
  - **Angular**: Services e Componentes correspondentes.
- Destaque de sintaxe (Syntax Highlighting) com botão de "Copiar Código".

---

## 🛠️ 5. Fases de Execução Passo a Passo (Build Plan)

### **Fase 1: Preparação do Ambiente e Estrutura**
1. Instalar o .NET 8 SDK se necessário (`winget install Microsoft.DotNet.SDK.8` ou via instalador oficial).
2. Criar a estrutura de diretórios `backend/` e `frontend/`.
3. Inicializar a Web API em `backend/` com `dotnet new webapi -n TargetDesafio.Api --use-controllers`.
4. Inicializar o projeto Angular em `frontend/` com `npx -y @angular/cli new frontend --routing --style=css --ssr=false`.

### **Fase 2: Implementação do Backend C# (.NET 8)**
1. **Modelos e DTOs**:
   - `Venda.cs`, `ComissaoVendedorDto.cs`, `RelatorioComissaoDto.cs`.
   - `Produto.cs`, `MovimentacaoEstoqueRequest.cs`, `MovimentacaoEstoqueResult.cs`.
   - `CalculoJurosRequest.cs`, `CalculoJurosResult.cs`.
2. **Serviços (Regras de Domínio)**:
   - `IComissaoService` / `ComissaoService`.
   - `IEstoqueService` / `EstoqueService` (com concorrência segura em memória).
   - `IJurosService` / `JurosService`.
3. **Controllers**:
   - `ComissaoController.cs`
   - `EstoqueController.cs`
   - `JurosController.cs`
   - `HealthController.cs` (para verificação de status e ping do Render).
4. **CORS & Swagger**:
   - Configurar política de CORS liberando a URL do Vercel e `localhost:4200`.
   - Ativar Swagger UI com anotações e exemplos claros.
5. **Testes Unitários**:
   - Criar projeto `TargetDesafio.Tests` com xUnit para validar os cálculos dos 3 desafios contra casos de teste extremos.

### **Fase 3: Implementação do Frontend Angular**
1. **Design System & Estilo**:
   - Definir variáveis CSS (Cores tema Target, modo escuro/claro, tipografia Inter/Outfit, glassmorphism, sombras suaves).
   - Layout responsivo: Navbar moderna, container principal, footer profissional.
2. **Core / Services**:
   - `ApiService`: Comunicação HTTP com interceptor para retry e fallback de dados.
   - `HealthService`: Monitoramento em tempo real do status da API C#.
3. **Páginas & Componentes**:
   - `ApresentacaoComponent`: Hero section do candidato e visão técnica.
   - `Desafio1Component`: Gestão e visualização de comissões.
   - `Desafio2Component`: Controle de estoque e movimentações.
   - `Desafio3Component`: Simulador de juros por atraso.
   - `CodigoComponent`: Visualizador de código interativo com abas C#/.NET.
4. **Roteamento & Transições**:
   - Configurar rotas amigáveis (`/`, `/desafio-1`, `/desafio-2`, `/desafio-3`, `/codigo`).

### **Fase 4: Preparação para Deploy**
1. **Backend (Render / Railway)**:
   - Criar `Dockerfile` otimizado multi-stage para .NET 8.
   - Configurar porta via variável de ambiente `PORT`.
2. **Frontend (Vercel)**:
   - Criar `vercel.json` com regra de reescrita para Single Page Application:
     ```json
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }
     ```
   - Configurar `environment.ts` e `environment.prod.ts` com a URL da API C# no Render.

---

## 🧪 6. Critérios de Aceitação & Validação

- [ ] **Desafio 1**: Cálculo correto para todas as vendas padrão (João Silva, Maria Souza, Carlos Oliveira, Ana Lima) validado por testes unitários e exibido com clareza.
- [ ] **Desafio 2**: Bloqueio de estoque negativo com mensagem de erro clara; identificador único gerado a cada movimentação; estoque final e histórico atualizados.
- [ ] **Desafio 3**: 0% para vencimentos futuros/atuais; 2,5% por dia para atraso calculado com precisão monetária (`decimal` em C#).
- [ ] **Apresentação**: Perfil profissional completo, responsivo e com visual moderno.
- [ ] **Showcase**: Código C# e Angular acessíveis na interface com formatação limpa.
- [ ] **Deploy**: Backend rodando no Render/Railway e Frontend rodando no Vercel.
