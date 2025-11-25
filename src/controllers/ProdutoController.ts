// src/controllers/ProdutoController.ts
import { Request, Response } from 'express';
import { pool } from '../database/database';

// FUNÇÃO HELPER PARA VALIDAR OS DADOS DO PRODUTO
const validateProdutoData = (data: any) => {
    const { nome, preco, categoria, em_promocao, preco_promocional } = data;
    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
        throw new Error('O nome do produto é obrigatório.');
    }
    if (preco == null || isNaN(parseFloat(preco))) {
        throw new Error('O preço é obrigatório e deve ser um número.');
    }
    if (!categoria) {
        throw new Error('A categoria é obrigatória.');
    }
    if (em_promocao === true && (preco_promocional == null || isNaN(parseFloat(preco_promocional)))) {
        throw new Error('O preço promocional é obrigatório quando o produto está em promoção.');
    }
};


// MÉTODO CREATE ATUALIZADO com validação
export const createProduto = async (req: Request, res: Response) => {
  try {
    // 1. Valida os dados antes de prosseguir
    validateProdutoData(req.body);

    const { nome, descricao, preco, categoria, imagem_url, em_promocao, preco_promocional } = req.body;
    
    // 2. Garante que preco_promocional seja null se não estiver em promoção
    const finalPrecoPromocional = em_promocao ? preco_promocional : null;
    
    const result = await pool.query(
      `INSERT INTO produtos (nome, descricao, preco, categoria, imagem_url, em_promocao, preco_promocional) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nome, descricao, preco, categoria, imagem_url, em_promocao, finalPrecoPromocional]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error("Erro detalhado ao criar produto:", error);
    // Retorna uma mensagem de erro mais útil para o front-end
    res.status(400).json({ erro: error.message || "Ocorreu um erro interno ao criar o produto." });
  }
};

// MÉTODO UPDATE ATUALIZADO com validação
export const updateProduto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // 1. Valida os dados
    validateProdutoData(req.body);

    const { nome, descricao, preco, categoria, imagem_url, em_promocao, preco_promocional } = req.body;

    // 2. Garante que preco_promocional seja null se não estiver em promoção
    const finalPrecoPromocional = em_promocao ? preco_promocional : null;

    const result = await pool.query(
      `UPDATE produtos SET 
         nome = $1, descricao = $2, preco = $3, categoria = $4, imagem_url = $5, 
         em_promocao = $6, preco_promocional = $7 
       WHERE id = $8 RETURNING *`,
      [nome, descricao, preco, categoria, imagem_url, em_promocao, finalPrecoPromocional, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error("Erro detalhado ao atualizar produto:", error);
    res.status(400).json({ erro: error.message || "Ocorreu um erro interno ao atualizar o produto." });
  }
};

// As outras funções (getAllProdutos, deleteProduto, etc.) podem continuar como estão.
// Copie e cole as outras funções do seu arquivo aqui se precisar.
export const getAllProdutos = async (req: Request, res: Response) => { try { const result = await pool.query('SELECT * FROM produtos ORDER BY categoria, nome'); res.status(200).json(result.rows); } catch (error) { res.status(500).json({ erro: "Ocorreu um erro ao buscar os produtos." }); } };
export const searchProdutos = async (req: Request, res: Response) => { try { const { termo } = req.query; if (!termo) return res.status(400).json({ erro: 'O parâmetro "termo" é obrigatório.' }); const result = await pool.query('SELECT * FROM produtos WHERE nome ILIKE $1', [`%${termo}%`]); res.status(200).json(result.rows); } catch (error) { res.status(500).json({ erro: "Ocorreu um erro ao pesquisar os produtos." }); } };
export const getProdutoById = async (req: Request, res: Response) => { try { const { id } = req.params; const result = await pool.query('SELECT * FROM produtos WHERE id = $1', [id]); if (result.rows.length === 0) return res.status(404).json({ erro: 'Produto não encontrado.' }); res.status(200).json(result.rows[0]); } catch (error) { res.status(500).json({ erro: "Ocorreu um erro ao buscar o produto." }); } };
export const deleteProduto = async (req: Request, res: Response) => { try { const { id } = req.params; await pool.query('DELETE FROM produtos WHERE id = $1', [id]); res.status(200).json({ mensagem: 'Produto excluído com sucesso.' }); } catch (error) { res.status(500).json({ erro: "Ocorreu um erro ao excluir o produto." }); } };