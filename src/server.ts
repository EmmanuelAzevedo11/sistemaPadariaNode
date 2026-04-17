import express from 'express';
import produtosRoutes from './routes/produtosRoutes';
import vendedorRoutes from './routes/vendedorRoutes';
import vendasRoutes from './routes/vendasRoutes';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { title } from 'node:process';

const app = express();

// Isso permite que a API receba dados em formato JSON
app.use(express.json());

// Rota de teste para ver se está on-line
app.get('/status', (req, res) => {
  res.json({ message: "API da Padaria está voando! 🚀" });
});


const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Padaria',
      version: '1.0.0',
      description: 'Sistema de Gerenciamento da Padaria',
    },
    servers: [{ url: 'http://localhost:3000' }],
    paths: {
      '/produtos': {
        get: {
          summary: 'Lista todos os produtos',
          responses: {
            200: { description: 'Sucesso' },
          },
        },
        post: {
          summary: 'Cria um novo produto',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nomeProduto: { type: 'string' },
                    codigo: { type: 'string' },
                    preco: { type: 'number' },
                    estoque: { type: 'number' },
                    categoriaId: { type: 'number' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Produto criado' },
            400: { description: 'Erro na requisição' }
          }
        }
      },
      '/produtos/{id}': {
        get: {
          summary: 'Busca um produto pelo ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            200: { description: 'Produto encontrado' },
            404: { description: 'Não encontrado' }
          }
        },
        put: {
          summary: 'Atualiza um produto',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nomeProduto: { type: 'string' },
                    preco: { type: 'number' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Atualizado com sucesso' }
          }
        },
        delete: {
          summary: 'Deleta um produto',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Deletado com sucesso' }
          }
        }
      }
    },
  },
  apis: [], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(produtosRoutes);
app.use(vendedorRoutes);
app.use(vendasRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🍞 Servidor rodando em http://localhost:${PORT}`);
});