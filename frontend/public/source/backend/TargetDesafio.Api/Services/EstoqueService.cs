using TargetDesafio.Api.Models;

namespace TargetDesafio.Api.Services;

public class EstoqueException(string message) : Exception(message);

public interface IEstoqueService
{
    IReadOnlyList<Produto> Listar();
    Movimentacao Movimentar(MovimentacaoRequest request);
    IReadOnlyList<Movimentacao> Historico();
    void Resetar();
}

public class EstoqueService : IEstoqueService
{
    private readonly object _lock = new();
    private List<Produto> _produtos = DadosPadrao.Estoque();
    private readonly List<Movimentacao> _historico = [];
    private int _sequencia;

    public IReadOnlyList<Produto> Listar()
    {
        lock (_lock)
            return _produtos.Select(p => new Produto
            {
                CodigoProduto = p.CodigoProduto,
                DescricaoProduto = p.DescricaoProduto,
                Estoque = p.Estoque
            }).ToList();
    }

    public Movimentacao Movimentar(MovimentacaoRequest request)
    {
        if (request.Quantidade <= 0)
            throw new EstoqueException("A quantidade deve ser maior que zero.");
        if (string.IsNullOrWhiteSpace(request.Descricao))
            throw new EstoqueException("A descrição da movimentação é obrigatória.");

        lock (_lock)
        {
            var produto = _produtos.FirstOrDefault(p => p.CodigoProduto == request.CodigoProduto)
                ?? throw new EstoqueException($"Produto {request.CodigoProduto} não encontrado.");

            var anterior = produto.Estoque;
            var final = request.Tipo == TipoMovimentacao.Entrada
                ? anterior + request.Quantidade
                : anterior - request.Quantidade;

            if (final < 0)
                throw new EstoqueException(
                    $"Estoque insuficiente para '{produto.DescricaoProduto}': disponível {anterior}, solicitado {request.Quantidade}.");

            produto.Estoque = final;

            var mov = new Movimentacao(
                $"MOV-{++_sequencia:0000}",
                produto.CodigoProduto,
                produto.DescricaoProduto,
                request.Tipo,
                request.Quantidade,
                request.Descricao.Trim(),
                anterior,
                final,
                DateTime.UtcNow);

            _historico.Add(mov);
            return mov;
        }
    }

    public IReadOnlyList<Movimentacao> Historico()
    {
        lock (_lock)
            return _historico.OrderByDescending(m => m.DataHora).ThenByDescending(m => m.Id).ToList();
    }

    public void Resetar()
    {
        lock (_lock)
        {
            _produtos = DadosPadrao.Estoque();
            _historico.Clear();
            _sequencia = 0;
        }
    }
}
