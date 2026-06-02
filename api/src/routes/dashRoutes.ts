import { Router } from "express";
import { getProdutosMaisVendidos, getTopVendedores } from "../repository/vendaRepository";

const route = Router();

route.get('/dashboard/summary', async (req, res) => {
  try {
    const { inicio, fim } = req.query;

    const dataInicio = inicio ? new Date(inicio as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const dataFim = fim ? new Date(fim as string) : new Date();

    const [produtos, vendedores] = await Promise.all([
      getProdutosMaisVendidos(dataInicio, dataFim),
      getTopVendedores(dataInicio, dataFim)
    ]);

    return res.status(200).json({ produtos, vendedores });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});


export default route;
