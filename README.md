# Sistema de Gestão de Pizzaria

## 1. Visão Geral

Este projeto é uma aplicação web full-stack desenvolvida para a gestão completa das operações de uma pizzaria. A solução inclui uma interface dinâmica para os clientes visualizarem o cardápio e realizarem pedidos, além de um painel administrativo robusto para o gerenciamento de produtos, clientes e análise de vendas.

Construído com **Node.js, Express e TypeScript** no backend, o sistema se destaca pela sua arquitetura limpa (Model-Service-Controller) e por uma abordagem de persistência de dados inteligente, utilizando arquivos `.csv` para dados estruturados e `.txt` para o histórico de comprovantes. O frontend é reativo e moderno, construído com **HTML, CSS e JavaScript puro**.

## 2. Principais Funcionalidades

-   **Gestão Completa de Produtos (CRUD):**
    -   **Criação, Leitura, Atualização e Exclusão** de todos os itens do cardápio.
    -   Suporte a múltiplas categorias, incluindo "Pizzas Salgadas", "Pizzas Doces", "Bebidas" e "Sobremesas".

-   **Filtro Dinâmico de Produtos:** A interface principal permite que os clientes filtrem o cardápio por categoria com um único clique, atualizando a visualização dos produtos em tempo real.

-   **Gestão de Clientes:**
    -   Página dedicada para o cadastro de novos clientes.
    -   Listagem de clientes no momento da finalização do pedido.

-   **Carrinho de Compras Persistente:** O carrinho utiliza o `localStorage` do navegador para que os itens selecionados não sejam perdidos ao recarregar a página.

-   **Sistema de Pedidos e Geração de Comprovantes:**
    -   Fluxo de checkout completo, associando um pedido a um cliente e a múltiplos itens.
    -   Para cada pedido finalizado, um arquivo de comprovante (`.txt`) é gerado e salvo automaticamente no servidor, criando um histórico de transações.

-   **Painel Administrativo com Relatórios de Vendas:**
    -   Uma página dedicada (`/admin.html`) para a visualização de métricas de negócio.
    -   O sistema lê **todo o histórico** de comprovantes salvos, processa os dados e gera **relatórios de vendas semanais e mensais**, exibindo o total arrecadado em cada período.

## 3. Estrutura do Projeto

O código é organizado seguindo o padrão de design **Model-Service-Controller** para garantir a separação de responsabilidades e facilitar a manutenção.

-   **/public**: Contém todos os arquivos do frontend, incluindo `index.html`, `admin.html`, e os scripts `script.js` e `admin.js`.
-   **/src**: Contém todo o código-fonte do backend em TypeScript.
    -   **/controllers**: Recebe as requisições HTTP e orquestra as operações (ex: `ProdutoController.ts`, `RelatorioController.ts`).
    -   **/database**: Armazena os arquivos `clientes.csv` e `itens.csv`.
    -   **/models**: Define as interfaces e tipos que representam os dados (`Produto.ts`, `Cliente.ts`).
    -   **/routes**: Define as rotas da API em `api.ts`.
    -   **/services**: Contém a lógica de negócio principal, incluindo a manipulação dos arquivos (`ProdutoService.ts`, `RelatorioService.ts`).
    -   `server.ts`: Ponto de entrada que configura e inicia o servidor Express.
-   **/comprovantes**: Diretório onde os comprovantes de pedido em `.txt` são salvos.

## 4. Tecnologias Utilizadas

-   **Backend**: Node.js, Express, TypeScript
-   **Manipulação de CSV**: `csv-parser`, `csv-writer`
-   **Desenvolvimento**: `ts-node-dev`
-   **Frontend**: HTML5, CSS3, JavaScript (ES6+)

## 5. Instalação e Execução

**Pré-requisitos**:
*   Node.js (versão 14 ou superior)
*   NPM

**Passos para instalação:**

1.  Clone o repositório ou navegue até a pasta raiz do projeto.
2.  Acessar a pasta "pizzaria-sistema" pelo terminal 
    ```bash
    cd 'pasta em que o repositório se encontra em sua máquina'
    ```
    ```bash
    cd pizzaria-sistema
    ```
3.  Abra um terminal e instale as dependências:
    ```bash
    npm install
    ```
4. Coloque no terminal 
    ```bash
    npm install express
    ```
    
**Para executar em modo de desenvolvimento (com recarregamento automático):**
```bash
npm run dev
```

O servidor será iniciado em `http://localhost:3000`.

**Para compilar e executar em modo de produção:**

1.  Compile o código TypeScript para JavaScript:
```bash
npm run build
```

2.  Inicie o servidor a partir dos arquivos compilados na pasta /dist:
```bash
npm run start
```