using System.Globalization;
using TargetDesafio.Api.Models;

namespace TargetDesafio.Api.Services;

public interface IJurosService
{
    JurosResult Calcular(JurosRequest request);
}

public class JurosService : IJurosService
{
    public const decimal TaxaDiaria = 0.025m; // 2,5% ao dia

    // Formatação manual no padrão brasileiro: independe de ICU/cultura instalada no servidor.
    private static string Moeda(decimal v)
    {
        var s = v.ToString("N2", CultureInfo.InvariantCulture); // 1,234.50
        return "R$ " + s.Replace(',', '#').Replace('.', ',').Replace('#', '.');
    }

    private static string Pct(decimal v) =>
        v.ToString("0.##", CultureInfo.InvariantCulture).Replace('.', ',');

    public JurosResult Calcular(JurosRequest request)
    {
        if (request.Valor <= 0)
            throw new ArgumentException("O valor deve ser maior que zero.");

        var vencimento = request.DataVencimento.Date;
        var hoje = (request.DataCalculo ?? DateTime.Today).Date;
        var dias = Math.Max(0, (hoje - vencimento).Days);

        var taxaTotal = dias * TaxaDiaria;
        var juros = Math.Round(request.Valor * taxaTotal, 2, MidpointRounding.AwayFromZero);
        var total = request.Valor + juros;

        var memorial = new List<string>
        {
            $"Valor original: {Moeda(request.Valor)}",
            $"Vencimento: {vencimento.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture)} | Data de cálculo: {hoje.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture)}",
            $"Dias de atraso: {dias}"
        };

        if (dias == 0)
        {
            memorial.Add("Título não vencido: sem incidência de juros.");
        }
        else
        {
            memorial.Add($"Taxa acumulada: {dias} × 2,5% = {Pct(taxaTotal * 100)}%");
            memorial.Add($"Juros: {Moeda(request.Valor)} × {Pct(taxaTotal * 100)}% = {Moeda(juros)}");
            memorial.Add($"Total a pagar: {Moeda(request.Valor)} + {Moeda(juros)} = {Moeda(total)}");
        }

        return new JurosResult(
            request.Valor, vencimento, hoje, dias,
            TaxaDiaria * 100m, taxaTotal * 100m, juros, total,
            dias == 0 ? "Em dia" : "Vencido", memorial);
    }
}
