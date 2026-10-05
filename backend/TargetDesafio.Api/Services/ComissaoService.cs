using TargetDesafio.Api.Models;

namespace TargetDesafio.Api.Services;

public interface IComissaoService
{
    decimal CalcularPercentual(decimal valorVenda);
    decimal CalcularComissao(decimal valorVenda);
    RelatorioComissaoDto Calcular(IEnumerable<Venda> vendas);
    RelatorioComissaoDto CalcularPadrao();
}

public class ComissaoService : IComissaoService
{
    /// <summary>
    /// Regra: &lt; 100 = 0%; &lt; 500 = 1%; &gt;= 500 = 5%.
    /// </summary>
    public decimal CalcularPercentual(decimal valorVenda) => valorVenda switch
    {
        < 100m => 0m,
        < 500m => 0.01m,
        _ => 0.05m
    };

    public decimal CalcularComissao(decimal valorVenda) =>
        Math.Round(valorVenda * CalcularPercentual(valorVenda), 2, MidpointRounding.AwayFromZero);

    public RelatorioComissaoDto Calcular(IEnumerable<Venda> vendas)
    {
        var detalhes = vendas
            .Select(v => new VendaComissaoDto(v.Vendedor, v.Valor, CalcularPercentual(v.Valor) * 100m, CalcularComissao(v.Valor)))
            .ToList();

        var vendedores = detalhes
            .GroupBy(d => d.Vendedor)
            .Select(g =>
            {
                var total = g.Sum(x => x.Valor);
                var comissao = g.Sum(x => x.Comissao);
                var efetivo = total == 0 ? 0 : Math.Round(comissao / total * 100m, 2);
                return new ComissaoVendedorDto(g.Key, g.Count(), total, comissao, efetivo);
            })
            .OrderByDescending(v => v.TotalComissao)
            .ToList();

        return new RelatorioComissaoDto(
            vendedores,
            detalhes,
            vendedores.Sum(v => v.TotalVendido),
            vendedores.Sum(v => v.TotalComissao));
    }

    public RelatorioComissaoDto CalcularPadrao() => Calcular(DadosPadrao.Vendas);
}

public static class DadosPadrao
{
    public static readonly List<Venda> Vendas =
    [
        new("João Silva", 1200.50m), new("João Silva", 950.75m), new("João Silva", 1800.00m),
        new("João Silva", 1400.30m), new("João Silva", 1100.90m), new("João Silva", 1550.00m),
        new("João Silva", 1700.80m), new("João Silva", 250.30m), new("João Silva", 480.75m),
        new("João Silva", 320.40m),

        new("Maria Souza", 2100.40m), new("Maria Souza", 1350.60m), new("Maria Souza", 950.20m),
        new("Maria Souza", 1600.75m), new("Maria Souza", 1750.00m), new("Maria Souza", 1450.90m),
        new("Maria Souza", 400.50m), new("Maria Souza", 180.20m), new("Maria Souza", 90.75m),

        new("Carlos Oliveira", 800.50m), new("Carlos Oliveira", 1200.00m), new("Carlos Oliveira", 1950.30m),
        new("Carlos Oliveira", 1750.80m), new("Carlos Oliveira", 1300.60m), new("Carlos Oliveira", 300.40m),
        new("Carlos Oliveira", 500.00m), new("Carlos Oliveira", 125.75m),

        new("Ana Lima", 1000.00m), new("Ana Lima", 1100.50m), new("Ana Lima", 1250.75m),
        new("Ana Lima", 1400.20m), new("Ana Lima", 1550.90m), new("Ana Lima", 1650.00m),
        new("Ana Lima", 75.30m), new("Ana Lima", 420.90m), new("Ana Lima", 315.40m)
    ];

    public static List<Produto> Estoque() =>
    [
        new() { CodigoProduto = 101, DescricaoProduto = "Caneta Azul", Estoque = 150 },
        new() { CodigoProduto = 102, DescricaoProduto = "Caderno Universitário", Estoque = 75 },
        new() { CodigoProduto = 103, DescricaoProduto = "Borracha Branca", Estoque = 200 },
        new() { CodigoProduto = 104, DescricaoProduto = "Lápis Preto HB", Estoque = 320 },
        new() { CodigoProduto = 105, DescricaoProduto = "Marcador de Texto Amarelo", Estoque = 90 }
    ];
}
