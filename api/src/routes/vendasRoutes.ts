import { Router } from "express";
import { buscarVendaPorId, buscarVendas, criarVenda, deleteVenda, retirarEstoqueItemVenda, updateVendas } from "../repository/vendaRepository";
import { authMiddleware } from "../middleware/authMiddleware";

const route = Router();

route.get('/venda', async (req, res) => {
    try {
        const listaVendas = await buscarVendas(); 

        return res.status(200).json({
            message: "Lista de vendas encontrada com sucesso",
            listaVendas: listaVendas
        });

    } catch (error: any) {
        return res.status(400).json({
            message: error.message
        });
    }
});

route.get('/venda/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const venda = await buscarVendaPorId(Number(id));

        return res.status(200).json({
            message: "Venda encontrada com sucesso",
            venda: venda
        });

    } catch (error: any) {
        return res.status(400).json({
            message: error.message
        });
    }
});

route.post('/venda', authMiddleware, async (req, res) => {
    try {
        const usuarioLogado = (req as any).user;
        const vendedorId = usuarioLogado.id;

        const { 
            valorTotalBruto, valorTotalLiquido, dataHoraVenda,
            clienteId, formaPagamentoId, descontoAplicado = 0, 
            cpfNotaFiscal = undefined, itens // <-- Adicionado aqui
        } = req.body;

        const vendaCriada = await criarVenda(
            valorTotalBruto, valorTotalLiquido, dataHoraVenda, Number(vendedorId), clienteId,
            formaPagamentoId, descontoAplicado, cpfNotaFiscal, itens // <-- Passado aqui
        );

        return res.status(201).json({
            message: "Venda criada com sucesso",
            vendaCriada: vendaCriada
        });

    } catch (error: any) {
        return res.status(422).json({ message: error.message });
    }
});

route.put('/venda/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const vendaAtualizada = await updateVendas(Number(id), req.body);

        return res.status(200).json({
            message: "Venda atualizada com sucesso",
            vendaAtualizada: vendaAtualizada
        });

    } catch (error: any) {
        return res.status(422).json({
            message: error.message, 
        });
    }

});

route.delete('/venda/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const retorno = await deleteVenda(Number(id));

        return res.status(200).json({
            message: "Venda excluida com sucesso",
            retorno: retorno
        });
    } catch (error: any) {
        return res.status(400).json({
            message: error.message
        });
    }
});

//essa rota serve para após a criação de venda o estoque seja descontado do produto

route.patch('/venda/:id/finalizar-estoque', async (req, res) => {
    try {
        const { id } = req.params;
        
        await retirarEstoqueItemVenda(Number(id));

        return res.status(200).json({ 
            message: "Estoque atualizado com sucesso para a venda!" 
        });
    } catch (error: any) {
        return res.status(422).json({ message: error.message });
    }
});

export default route;