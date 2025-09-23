import fs from 'fs';
import path from 'path';

interface Venda {
  data: Date;
  total: number;
}

export interface RelatorioVendas {
  relatorioSemanal: { semana: string; total: number }[];
  relatorioMensal: { mes: string; total: number }[];
}

const caminhoComprovantes = path.resolve(process.cwd(), 'comprovantes');

export class RelatorioService {
  private static parseComprovante(conteudo: string): Venda | null {
    try {
      const matchData = conteudo.match(/Data: (.*)/); // Procura por "Data: "
      const matchTotal = conteudo.match(/TOTAL DO PEDIDO: R\$ (.*)/);

      if (!matchData || !matchTotal) return null;

      const [dataStr, horaStr] = matchData[1].split(' ');
      const [dia, mes, ano] = dataStr.split('/').map(Number);
      const [hora, min, seg] = horaStr.split(':').map(Number);
      const data = new Date(ano, mes - 1, dia, hora, min, seg);

      const total = parseFloat(matchTotal[1].replace(',', '.'));
      
      if (isNaN(data.getTime()) || isNaN(total)) return null;

      return { data, total };
    } catch (error) {

      console.error('Erro ao tentar parsear um comprovante:', error);
      return null;
    }
  }

  static async gerarRelatorioVendas(): Promise<RelatorioVendas> {
    console.log(`DEBUG: Verificando comprovantes no caminho: ${caminhoComprovantes}`); // Para debug
    
    if (!fs.existsSync(caminhoComprovantes)) {
        console.warn('AVISO: A pasta de comprovantes não foi encontrada.');
        return { relatorioSemanal: [], relatorioMensal: [] };
    }
    
    const nomesArquivos = await fs.promises.readdir(caminhoComprovantes);
    const vendas: Venda[] = [];

    for (const nomeArquivo of nomesArquivos) {
      if (path.extname(nomeArquivo) === '.txt') {
        const conteudo = await fs.promises.readFile(path.join(caminhoComprovantes, nomeArquivo), 'utf-8');
        const venda = this.parseComprovante(conteudo);
        if (venda) vendas.push(venda);
      }
    }
    
    if(vendas.length === 0) {
        console.warn('AVISO: Nenhum comprovante válido foi encontrado para processar.');
    }

    const totalPorMes: { [key: string]: number } = {};
    const totalPorSemana: { [key: string]: number } = {};

    for (const venda of vendas) {
      const chaveMes = `${venda.data.getFullYear()}/${String(venda.data.getMonth() + 1).padStart(2, '0')}`;
      totalPorMes[chaveMes] = (totalPorMes[chaveMes] || 0) + venda.total;

      const inicioDaSemana = new Date(venda.data);
      inicioDaSemana.setDate(venda.data.getDate() - venda.data.getDay());
      const chaveSemana = inicioDaSemana.toISOString().split('T')[0];
      totalPorSemana[chaveSemana] = (totalPorSemana[chaveSemana] || 0) + venda.total;
    }

    const relatorioMensal = Object.entries(totalPorMes)
        .map(([mes, total]) => ({ mes, total }))
        .sort((a, b) => b.mes.localeCompare(a.mes));
    
    const relatorioSemanal = Object.entries(totalPorSemana)
        .map(([semana, total]) => ({ semana: `Semana de ${new Date(semana).toLocaleDateString('pt-BR')}`, total }))
        .sort((a, b) => new Date(b.semana.split(' de ')[1].split('/').reverse().join('-')).getTime() - new Date(a.semana.split(' de ')[1].split('/').reverse().join('-')).getTime());

    return { relatorioMensal, relatorioSemanal };
  }
}