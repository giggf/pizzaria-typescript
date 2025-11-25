// src/database/database.ts

import { Pool } from 'pg'; // Importa a classe Pool da biblioteca 'pg'

// Cria uma nova instância do Pool com as configurações de conexão.
// Estas são as mesmas credenciais que você usou no comando do Docker.
const pool = new Pool({
  user: 'Pizzaria',
  host: 'localhost', // Se o Docker estiver rodando na sua máquina
  database: 'db_pizzaria',
  password: 'Pizzaria@2025',
  port: 5432,
});

// A linha mais importante: exporta a instância do pool como uma constante nomeada.
// É isso que permite que outros arquivos façam: import { pool } from './database/database';
export { pool };