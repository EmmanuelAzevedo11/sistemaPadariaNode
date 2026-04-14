import express from 'express';
import produtosRoutes from './routes/produtosRoutes';
import vendedorRoutes from './routes/vendedorRoutes';


const app = express();

// Isso permite que a API receba dados em formato JSON
app.use(express.json());

// Rota de teste para ver se está on-line
app.get('/status', (req, res) => {
  res.json({ message: "API da Padaria está voando! 🚀" });
});


app.use(produtosRoutes);
app.use(vendedorRoutes);


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🍞 Servidor rodando em http://localhost:${PORT}`);
});