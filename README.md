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
*   pgAdmin 4
*   Dokcer v28.4.0

**Passos para a instalação do container no Docker:**
1. Abra o terminal PowerShell
2. Copie e cole o código abaixo por completo
    ```cmd powershell
    hostname
    docker run -d `
    --name sistema-pizzaria `
    -e POSTGRES_USER=Pizzaria `
    -e POSTGRES_PASSWORD=Pizzaria@2025 `
    -e POSTGRES_DB=db_pizzaria `
    -p 5432:5432 `
    postgres:latest 
    ```

**Passos para clonagem de repositório e acesso:**

1.  Clone o repositório ou navegue até a pasta raiz do projeto.
2.  Acessar a pasta "pizzaria-sistema" pelo terminal 
    ```bash
    cd 'pasta em que o repositório se encontra em sua máquina'
    ```
    ```bash
    cd Pizzaria-Sistema
    ```
3.  Abra um terminal e instale as dependências:
    ```bash
    npm install
    ```
4. Coloque no terminal 
    ```bash
    npm install express
    ```

**Passos para a configuração do pgAdmin 4:**
1. Abra o pgAdmin (essa etapa pode demorar um pouco)
2. Selecione "Add New Server"e dê um nome para a imagem do servidor 
3. Coloque o nome do host como `localhost`
4. Mantenha a porta como `5432`, se ela não estiver, altere-a 
5. Altere o username para `Pizzaria`
6. Coloque a senha `Pizzaria@2025`
7. Salve as alterações 
8. Entre no servidor 
9. Entre em "Database"
10. Entre em "db_pizzaria"
11. Clique com o botão direito do mouse
12. Selecione o arquivo chamado "database" do repositório clonado

**Para executar em modo de desenvolvimento (com recarregamento automático):**
```bash
npm run dev
```

O servidor será iniciado em `http://localhost:3000`.
