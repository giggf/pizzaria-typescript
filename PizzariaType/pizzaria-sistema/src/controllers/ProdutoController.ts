import { Request, Response } from 'express';
import { ProdutoService } from '../services/ProdutoService';
import { CategoriaProduto } from '../models/Produto';

export class ProdutoController {
  
  static listar(req: Request, res: Response) {
    const categoria = req.query.categoria as CategoriaProduto | undefined;
    return res.json(ProdutoService.listar(categoria));
  }

  static buscarPorId(req: Request, res: Response) {
    const produto = ProdutoService.buscarPorId(parseInt(req.params.id));
    return produto ? res.json(produto) : res.status(404).json({ erro: 'Produto não encontrado' });
  }

  static async criar(req: Request, res: Response) {
    const { nome, descricao, preco, categoria } = req.body;

    if (!nome || !descricao || preco === undefined || !categoria) {
      return res.status(400).json({ erro: 'Todos os campos (nome, descricao, preco, categoria) são obrigatórios' });
    }
    if (typeof preco !== 'number') {
      return res.status(400).json({ erro: 'O preço deve ser um número.' });
    }
    
    // --- CORREÇÃO APLICADA AQUI ---
    // Adicionamos 'pizzas doces' à lista de categorias permitidas para validação.
    const categoriasValidas: CategoriaProduto[] = ['pizza', 'pizzas doces', 'bebida', 'sobremesa'];
    
    if (!categoriasValidas.includes(categoria)) {
      return res.status(400).json({ erro: 'Categoria inválida. Use pizza, pizzas doces, bebida ou sobremesa.' });
    }

    const novoProduto = await ProdutoService.criar(nome, descricao, preco, categoria);
    return res.status(201).json(novoProduto);
  }

  static async excluir(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const sucesso = await ProdutoService.excluir(id);

    if (sucesso) {
      return res.status(200).json({ message: 'Produto excluído com sucesso.' });
    } else {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }
  }

  static async editar(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const dadosProduto = req.body;

    const produtoAtualizado = await ProdutoService.editar(id, dadosProduto);

    if (produtoAtualizado) {
      return res.json(produtoAtualizado);
    } else {
      return res.status(404).json({ erro: 'Produto não encontrado para edição.' });
    }
  }
}