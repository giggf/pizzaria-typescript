// src/services/ProdutoService.ts

import pool from '../database/database';

interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  categoria: string;
}

export class ProdutoService {

  static async listar(): Promise<Produto[]> {
    try {
      const sql = 'SELECT * FROM itens ORDER BY Categoria, Nome;';
      const resultado = await pool.query(sql);
      return resultado.rows;
    } catch (error) {
      console.error('Erro ao listar itens:', error);
      throw error;
    }
  }

  static async buscarPorId(id: number): Promise<Produto | undefined> {
    try {
      const sql = 'SELECT * FROM itens WHERE ID = $1;';
      const resultado = await pool.query(sql, [id]);
      return resultado.rows[0];
    } catch (error) {
      console.error(`Erro ao buscar item com ID ${id}:`, error);
      throw error;
    }
  }

  static async criar(produto: Produto): Promise<Produto> {
    try {
      const { id, nome, descricao, preco, categoria } = produto;
      const sql = 'INSERT INTO itens (ID, Nome, Descricao, Preco, Categoria) VALUES ($1, $2, $3, $4, $5) RETURNING *;';
      const values = [id, nome, descricao, preco, categoria];
      const resultado = await pool.query(sql, values);
      return resultado.rows[0];
    } catch (error) {
      console.error('Erro ao criar item:', error);
      throw error;
    }
  }

  static async editar(id: number, dados: Partial<Produto>): Promise<Produto> {
    try {
      const { nome, descricao, preco, categoria } = dados;
      const sql = 'UPDATE itens SET Nome = $1, Descricao = $2, Preco = $3, Categoria = $4 WHERE ID = $5 RETURNING *;';
      const values = [nome, descricao, preco, categoria, id];
      const resultado = await pool.query(sql, values);
      if (resultado.rowCount === 0) throw new Error('Produto não encontrado para edição.');
      return resultado.rows[0];
    } catch (error) {
      console.error(`Erro ao editar item com ID ${id}:`, error);
      throw error;
    }
  }

  static async excluir(id: number): Promise<boolean> {
    try {
      const sql = 'DELETE FROM itens WHERE ID = $1;';
      const resultado = await pool.query(sql, [id]);
      return (resultado.rowCount || 0) > 0;
    } catch (error) {
      console.error(`Erro ao excluir item com ID ${id}:`, error);
      throw error;
    }
  }

  static async search(termo: string): Promise<Produto[]> {
    try {
      const sql = 'SELECT * FROM itens WHERE Nome ILIKE $1 OR Categoria ILIKE $1 ORDER BY Nome;';
      const values = [`%${termo}%`];
      const resultado = await pool.query(sql, values);
      return resultado.rows;
    } catch (error) {
      console.error('Erro ao pesquisar itens:', error);
      throw error;
    }
  }

  static async atualizarPromocao(id: number, emPromocao: boolean, precoPromocional?: number): Promise<Produto> {
    try {
      const precoFinal = emPromocao ? precoPromocional : null;
      const sql = 'UPDATE itens SET em_promocao = $1, preco_promocional = $2 WHERE ID = $3 RETURNING *;';
      const values = [emPromocao, precoFinal, id];
      const resultado = await pool.query(sql, values);
      if (resultado.rowCount === 0) throw new Error('Produto não encontrado.');
      return resultado.rows[0];
    } catch (error) {
      console.error(`Erro ao atualizar promoção do item ${id}:`, error);
      throw error;
    }
  }

  static async atualizarUrlImagem(id: number, url: string): Promise<Produto> {
    try {
      const sql = 'UPDATE itens SET imagem_url = $1 WHERE ID = $2 RETURNING *;';
      const values = [url, id];
      const resultado = await pool.query(sql, values);
      if (resultado.rowCount === 0) throw new Error('Produto não encontrado.');
      return resultado.rows[0];
    } catch (error) {
      console.error(`Erro ao atualizar imagem do item ${id}:`, error);
      throw error;
    }
  }
}