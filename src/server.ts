// src/server.ts

import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRoutes from './routes/api';

// Import NOMEADO com chaves {} - Esta é a correção principal!
import { pool } from './database/database';

const app = express();
const PORT = process.env.PORT || 3000;

// Função assíncrona para iniciar o servidor
async function startServer() {
  try {
    // 1. Tenta conectar ao banco de dados primeiro
    const client = await pool.connect();
    console.log('✅ Base de dados conectada com sucesso!');
    client.release(); // Libera o cliente de volta para o pool

    // 2. Se a conexão for bem-sucedida, configura e inicia o servidor Express
    app.use(cors());
    app.use(express.json());

    // Configura o Express para servir os arquivos estáticos da pasta 'public'
    app.use(express.static(path.join(__dirname, '../public')));

    // Rota para a página inicial, que deve ser a de login
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/login.html'));
    });
    
    // Configura as rotas da API, prefixadas com /api
    app.use('/api', apiRoutes);

    // Inicia o servidor na porta especificada
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });

  } catch (error) {
    // Se a conexão com o banco falhar, o servidor não inicia
    console.error('❌ Falha ao conectar com o banco de dados:', error);
    process.exit(1); // Encerra o processo com um código de erro
  }
}

// Chama a função para iniciar tudo
startServer();