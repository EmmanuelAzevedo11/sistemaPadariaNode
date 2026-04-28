# Sistema de Padaria 🍞

Um sistema simples e elegante para gerenciamento de produtos, vendas e vendedores de uma padaria.

## 🚀 Como começar

Siga estes passos simples para rodar o projeto na sua máquina:

### 1. Pré-requisitos
*   **Node.js** instalado.
*   **MySQL** rodando (pode ser via Docker ou instalação local).

### 2. Configuração inicial
Abra o terminal na pasta raiz do projeto e execute:
```bash
# Instala as ferramentas principais
npm install

# Instala as dependências da API
npm run setup
```

### 3. Banco de Dados
1.  Crie um arquivo chamado `.env` dentro da pasta `api/`.
2.  Copie o conteúdo do arquivo `.env.example` para o seu novo `.env` e ajuste a URL de conexão se necessário.
3.  Execute os comandos abaixo para preparar o banco:
```bash
# Cria as tabelas no banco
cd api
npx prisma migrate dev --name init

# Popula o banco com dados iniciais (categorias, etc)
npm run seed
cd ..
```

### 4. Rodando o projeto
Para iniciar tanto o **Backend (API)** quanto o **Frontend (Cliente)** ao mesmo tempo, basta rodar:
```bash
npm run dev
```

*   **Frontend**: Acesse `http://localhost:5500`
*   **API**: Rodando em `http://localhost:3000`

---

## 🛠️ Estrutura do Projeto
*   `/api`: Servidor Backend construído com Node.js, Express e Prisma.
*   `/client`: Frontend construído com HTML, CSS e JavaScript puro (Vanilla JS).

Pronto! Agora é só aproveitar o sistema. 🥯🥖
