namespace TargetDesafio.Api.Models;

// ---------- Desafio 1: Comissões ----------
public record Venda(string Vendedor, decimal Valor);

public record VendasRequest(List<Venda> Vendas);

public record VendaComissaoDto(string Vendedor, decimal Valor, decimal PercentualComissao, decimal Comissao);

public record ComissaoVendedorDto(
    string Vendedor,
    int QuantidadeVendas,
    decimal TotalVendido,
    decimal TotalComissao,
    decimal PercentualEfetivo);

public record RelatorioComissaoDto(
    List<ComissaoVendedorDto> Vendedores,
    List<VendaComissaoDto> Detalhes,
    decimal TotalVendido,
    decimal TotalComissao);

// ---------- Desafio 2: Estoque ----------
public class Produto
{
    public int CodigoProduto { get; set; }
    public string DescricaoProduto { get; set; } = string.Empty;
    public int Estoque { get; set; }
}

public enum TipoMovimentacao
{
    Entrada,
    Saida
}

public record MovimentacaoRequest(int CodigoProduto, TipoMovimentacao Tipo, int Quantidade, string Descricao);

public record Movimentacao(
    string Id,
    int CodigoProduto,
    string DescricaoProduto,
    TipoMovimentacao Tipo,
    int Quantidade,
    string Descricao,
    int EstoqueAnterior,
    int EstoqueFinal,
    DateTime DataHora);

// ---------- Desafio 3: Juros ----------
public record JurosRequest(decimal Valor, DateTime DataVencimento, DateTime? DataCalculo);

public record JurosResult(
    decimal ValorOriginal,
    DateTime DataVencimento,
    DateTime DataCalculo,
    int DiasAtraso,
    decimal TaxaDiariaPercentual,
    decimal TaxaTotalPercentual,
    decimal ValorJuros,
    decimal ValorTotal,
    string Status,
    List<string> Memorial);

public record ErroResponse(string Erro);
