import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import { Produto, CategoriaProduto } from '../models/Produto';

let produtos: Produto[] = [];
let proximoId = 1;
const caminhoItensCsv = path.join(__dirname, '..', 'database', 'itens.csv');

export class ProdutoService {
  static async inicializarProdutos() {
    if (!fs.existsSync(caminhoItensCsv)) {
      console.warn("⚠️ Arquivo itens.csv não encontrado. A lista de produtos estará vazia.");
      return;
    }

    produtos = await this.lerProdutosDeCSV(caminhoItensCsv);

    if (produtos.length > 0) {
      proximoId = Math.max(...produtos.map(p => p.id)) + 1;
    }
    console.log('✅ Itens carregados do arquivo unificado com sucesso!');
  }

  private static lerProdutosDeCSV(caminhoArquivo: string): Promise<Produto[]> {
    return new Promise((resolve, reject) => {
      const resultados: Produto[] = [];
      fs.createReadStream(caminhoArquivo)
        .pipe(csv())
        .on('data', (data) => {
          if (data.ID && data.Nome) {
            resultados.push({
              id: parseInt(data.ID), nome: data.Nome, descricao: data.Descricao,
              preco: parseFloat(data.Preco), categoria: data.Categoria as CategoriaProduto,
            });
          }
        })
        .on('end', () => resolve(resultados))
        .on('error', (error) => reject(error));
    });
  }

  static async criar(nome: string, descricao: string, preco: number, categoria: CategoriaProduto): Promise<Produto> {
    const novoProduto: Produto = { id: proximoId++, nome, descricao, preco, categoria };
    produtos.push(novoProduto);
    await this.salvarItensEmCSV();
    return novoProduto;
  }

  static async excluir(id: number): Promise<boolean> {
    const index = produtos.findIndex(p => p.id === id);
    if (index === -1) return false;
    produtos.splice(index, 1);
    await this.salvarItensEmCSV();
    return true;
  }

  // --- NOVO MÉTODO ADICIONADO ---
  static async editar(id: number, dadosProduto: Partial<Produto>): Promise<Produto | null> {
    const index = produtos.findIndex(p => p.id === id);
    if (index === -1) {
      return null;
    }
    const produtoOriginal = produtos[index];
    const produtoAtualizado = {
      ...produtoOriginal,
      ...dadosProduto,
    };
    produtos[index] = produtoAtualizado;
    await this.salvarItensEmCSV();
    return produtoAtualizado;
  }
  
  private static async salvarItensEmCSV() {
    const writer = createObjectCsvWriter({
      path: caminhoItensCsv,
      header: [
        { id: 'id', title: 'ID' }, { id: 'nome', title: 'Nome' },
        { id: 'descricao', title: 'Descricao' }, { id: 'preco', title: 'Preco' },
        { id: 'categoria', title: 'Categoria' },
      ],
    });
    await writer.writeRecords(produtos);
    console.log('📝 Arquivo itens.csv atualizado com sucesso.');
  }

  static listar(categoria?: CategoriaProduto): Produto[] { 
    if (categoria) {
      return produtos.filter(p => p.categoria === categoria);
    }
    return produtos; 
  }

  static buscarPorId(id: number): Produto | undefined { return produtos.find(p => p.id === id); }
}