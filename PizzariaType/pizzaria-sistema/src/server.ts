import express from 'express';
import apiRoutes from './routes/api';
import { ProdutoService } from './services/ProdutoService';

const app = express();
const PORT = 3000;

app.use(express.json());

// --- ADICIONE ESTA LINHA AQUI ---
// Este middleware diz ao Express: "Sirva todos os arquivos da pasta 'public' como arquivos estáticos".
app.use(express.static('public')); 
// ---------------------------------

// Nossas rotas da API continuam funcionando normalmente no prefixo /api
app.use('/api', apiRoutes);

// ... imports no topo do arquivo
import { ClienteService } from './services/ClienteService'; // Adicione este import

// ...

async function startServer() {
  try {
    // Agora inicializamos os dois serviços
    await ProdutoService.inicializarProdutos();
    await ClienteService.inicializarClientes(); // Adicione esta linha

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Falha ao iniciar o servidor:", error);
  }
}

startServer();