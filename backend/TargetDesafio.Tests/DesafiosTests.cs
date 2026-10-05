using TargetDesafio.Api.Models;
using TargetDesafio.Api.Services;

namespace TargetDesafio.Tests;

public class ComissaoTests
{
    private readonly ComissaoService _s = new();

    [Theory]
    [InlineData(99.99, 0)]
    [InlineData(100, 0.01)]
    [InlineData(499.99, 0.01)]
    [InlineData(500, 0.05)]
    [InlineData(1000, 0.05)]
    public void Percentual_RespeitaFaixas(double valor, double esperado) =>
        Assert.Equal((decimal)esperado, _s.CalcularPercentual((decimal)valor));

    [Fact]
    public void Padrao_AgrupaQuatroVendedores()
    {
        var r = _s.CalcularPadrao();
        Assert.Equal(4, r.Vendedores.Count);
        Assert.Equal(36, r.Detalhes.Count);
        Assert.Equal(r.Vendedores.Sum(v => v.TotalComissao), r.TotalComissao);
    }

    [Fact]
    public void Carlos_ValorDe500GeraCincoPorCento() =>
        Assert.Equal(25m, _s.CalcularComissao(500m));
}

public class EstoqueTests
{
    [Fact]
    public void Entrada_SomaEGeraIdUnico()
    {
        var s = new EstoqueService();
        var a = s.Movimentar(new(101, TipoMovimentacao.Entrada, 10, "Reposição"));
        var b = s.Movimentar(new(101, TipoMovimentacao.Saida, 5, "Venda"));
        Assert.Equal(160, a.EstoqueFinal);
        Assert.Equal(155, b.EstoqueFinal);
        Assert.NotEqual(a.Id, b.Id);
    }

    [Fact]
    public void Saida_MaiorQueSaldo_Lanca() =>
        Assert.Throws<EstoqueException>(() =>
            new EstoqueService().Movimentar(new(102, TipoMovimentacao.Saida, 76, "Venda")));

    [Fact]
    public void ProdutoInexistente_Lanca() =>
        Assert.Throws<EstoqueException>(() =>
            new EstoqueService().Movimentar(new(999, TipoMovimentacao.Entrada, 1, "x")));

    [Fact]
    public void Resetar_RestauraPadrao()
    {
        var s = new EstoqueService();
        s.Movimentar(new(101, TipoMovimentacao.Saida, 50, "Venda"));
        s.Resetar();
        Assert.Equal(150, s.Listar().First(p => p.CodigoProduto == 101).Estoque);
        Assert.Empty(s.Historico());
    }
}

public class JurosTests
{
    private readonly JurosService _s = new();

    [Fact]
    public void NaoVencido_SemJuros()
    {
        var r = _s.Calcular(new(100m, new DateTime(2026, 10, 10), new DateTime(2026, 10, 5)));
        Assert.Equal(0, r.DiasAtraso);
        Assert.Equal(0m, r.ValorJuros);
        Assert.Equal(100m, r.ValorTotal);
    }

    [Fact]
    public void CincoDiasAtraso_DozeVirgulaCincoPorCento()
    {
        var r = _s.Calcular(new(1000m, new DateTime(2026, 10, 1), new DateTime(2026, 10, 6)));
        Assert.Equal(5, r.DiasAtraso);
        Assert.Equal(125m, r.ValorJuros);
        Assert.Equal(1125m, r.ValorTotal);
    }

    [Fact]
    public void Memorial_FormataMoedaNoPadraoBrasileiro()
    {
        var r = _s.Calcular(new(1000m, new DateTime(2026, 10, 1), new DateTime(2026, 10, 6)));
        Assert.Contains(r.Memorial, l => l.Contains("R$ 1.125,00"));
        Assert.Contains(r.Memorial, l => l.Contains("12,5%"));
    }

    [Fact]
    public void ValorInvalido_Lanca() =>
        Assert.Throws<ArgumentException>(() => _s.Calcular(new(0m, DateTime.Today, null)));
}
