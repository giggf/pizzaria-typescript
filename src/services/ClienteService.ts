// src/services/ClienteService.ts

import pool from '../database/database'; 
import { Cliente } from '../models/Cliente';

export class ClienteService {
  
  static async criar(nome: string, telefone: string, endereco?: string): Promise<Cliente> {
    try {
      const sql = 'INSERT INTO clientes (Nome, Telefone, Endereco, DataCadastro) VALUES ($1, $2, $3, NOW()) RETURNING *';
      const values = [nome, telefone, endereco || null];
      const resultado = await pool.query(sql, values);
      return resultado.rows[0];
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw new Error('Não foi possível criar o cliente.');
    }
  }
  
  static async listar(): Promise<Cliente[]> {
    try {
      const sql = 'SELECT * FROM clientes ORDER BY Nome;';
      const resultado = await pool.query(sql);
      return resultado.rows;
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      throw new Error('Não foi possível buscar os clientes.');
    }
  }

  static async buscarPorId(id: number): Promise<Cliente | undefined> {
    try {
      const sql = 'SELECT * FROM clientes WHERE ID = $1;';
      const resultado = await pool.query(sql, [id]);
      return resultado.rows[0];
    } catch (error) {
      console.error(`Erro ao buscar cliente com ID ${id}:`, error);
      throw new Error('Não foi possível buscar o cliente.');
    }
  }

  static async search(termo: string): Promise<Cliente[]> {
    try {
      const sql = 'SELECT * FROM clientes WHERE Nome ILIKE $1 OR Telefone ILIKE $1 ORDER BY Nome;';
      const values = [`%${termo}%`];
      const resultado = await pool.query(sql, values);
      return resultado.rows;
    } catch (error) {
      console.error('Erro ao pesquisar clientes:', error);
      throw new Error('Não foi possível pesquisar os clientes.');
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const sql = 'DELETE FROM clientes WHERE ID = $1;';
      const resultado = await pool.query(sql, [id]);
      return (resultado.rowCount || 0) > 0; // Correção aplicada
    } catch (error) {
      console.error(`Erro ao deletar cliente com ID ${id}:`, error);
      throw new Error('Não foi possível deletar o cliente.');
    }
  }
}