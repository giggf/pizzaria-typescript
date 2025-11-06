import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import { Cliente } from '../models/Cliente';

let clientes: Cliente[] = [];
let proximoId = 1;
const caminhoClientesCsv = path.join(__dirname, '..', 'database', 'clientes.csv');

export class ClienteService {
  static async inicializarClientes() {
    return new Promise<void>((resolve, reject) => {
      const resultados: Cliente[] = [];
      fs.createReadStream(caminhoClientesCsv)
        .pipe(csv())
        .on('data', (data) => {
          // --- CORREÇÃO DE LEITURA ---
          // Se a célula 'DataCadastro' for vazia ou inválida, 'date' será uma Data Inválida.
          const date = new Date(data.DataCadastro);
          // Verificamos se a data é válida. Se não for, usamos a data atual.
          const dataCadastroValida = !isNaN(date.getTime()) ? date : new Date();

          resultados.push({
            id: parseInt(data.ID),
            nome: data.Nome,
            telefone: data.Telefone,
            endereco: data.Endereco,
            dataCadastro: dataCadastroValida,
          });
        })
        .on('end', () => {
          clientes = resultados;
          if (clientes.length > 0) {
            proximoId = Math.max(...clientes.map(c => c.id)) + 1;
          }
          console.log('✅ Clientes carregados do CSV com sucesso!');
          resolve();
        })
        .on('error', (error) => { reject(error); });
    });
  }
  
  static async criar(nome: string, telefone: string, endereco?: string): Promise<Cliente> {
    const novoCliente: Cliente = {
      id: proximoId++, nome, telefone, endereco: endereco || '', dataCadastro: new Date()
    };
    clientes.push(novoCliente);
    await this.salvarClientesEmCSV();
    return novoCliente;
  }
  
  private static async salvarClientesEmCSV() {
    const writer = createObjectCsvWriter({
      path: caminhoClientesCsv,
      header: [
        { id: 'id', title: 'ID' }, { id: 'nome', title: 'Nome' },
        { id: 'telefone', title: 'Telefone' }, { id: 'endereco', title: 'Endereco' },
        { id: 'dataCadastro', title: 'DataCadastro' },
      ],
    });

    // --- CORREÇÃO DE ESCRITA ---
    const records = clientes.map(cliente => {
      // Se o cliente tiver uma propriedade de data válida, converte.
      // Se for inválida por algum motivo, salva uma string vazia para evitar quebrar.
      const dataFormatada = (cliente.dataCadastro && !isNaN(new Date(cliente.dataCadastro).getTime()))
        ? new Date(cliente.dataCadastro).toISOString()
        : '';

      return { ...cliente, dataCadastro: dataFormatada };
    });

    await writer.writeRecords(records);
    console.log('📝 Arquivo clientes.csv atualizado com sucesso.');
  }

  static listar(): Cliente[] { return clientes; }
  static buscarPorId(id: number): Cliente | undefined { return clientes.find(c => c.id === id); }
}