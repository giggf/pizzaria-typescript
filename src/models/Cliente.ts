export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  endereco?: string;
  dataCadastro: Date;
}