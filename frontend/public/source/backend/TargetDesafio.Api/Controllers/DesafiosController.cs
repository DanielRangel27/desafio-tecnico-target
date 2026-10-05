using Microsoft.AspNetCore.Mvc;
using TargetDesafio.Api.Models;
using TargetDesafio.Api.Services;

namespace TargetDesafio.Api.Controllers;

[ApiController]
[Route("api")]
public class HealthController : ControllerBase
{
    [HttpGet("health")]
    public IActionResult Health() => Ok(new { status = "ok", horario = DateTime.UtcNow });
}

[ApiController]
[Route("api/desafios/comissoes")]
public class ComissaoController(IComissaoService service) : ControllerBase
{
    [HttpGet("padrao")]
    public ActionResult<RelatorioComissaoDto> Padrao() => service.CalcularPadrao();

    [HttpPost("calcular")]
    public ActionResult<RelatorioComissaoDto> Calcular([FromBody] VendasRequest request)
    {
        if (request.Vendas is null || request.Vendas.Count == 0)
            return BadRequest(new ErroResponse("Informe ao menos uma venda."));
        if (request.Vendas.Any(v => string.IsNullOrWhiteSpace(v.Vendedor) || v.Valor < 0))
            return BadRequest(new ErroResponse("Vendas devem ter vendedor e valor não negativo."));
        return service.Calcular(request.Vendas);
    }
}

[ApiController]
[Route("api/desafios/estoque")]
public class EstoqueController(IEstoqueService service) : ControllerBase
{
    [HttpGet]
    public ActionResult<IReadOnlyList<Produto>> Listar() => Ok(service.Listar());

    [HttpGet("historico")]
    public ActionResult<IReadOnlyList<Movimentacao>> Historico() => Ok(service.Historico());

    [HttpPost("movimentar")]
    public IActionResult Movimentar([FromBody] MovimentacaoRequest request)
    {
        try
        {
            var mov = service.Movimentar(request);
            return Ok(new { movimentacao = mov, estoqueFinal = mov.EstoqueFinal });
        }
        catch (EstoqueException ex)
        {
            return BadRequest(new ErroResponse(ex.Message));
        }
    }

    [HttpPost("resetar")]
    public IActionResult Resetar()
    {
        service.Resetar();
        return NoContent();
    }
}

[ApiController]
[Route("api/desafios/juros")]
public class JurosController(IJurosService service) : ControllerBase
{
    [HttpPost("calcular")]
    public IActionResult Calcular([FromBody] JurosRequest request)
    {
        try
        {
            return Ok(service.Calcular(request));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ErroResponse(ex.Message));
        }
    }
}
