import { Router } from "express";
import { buscarVedendores, buscarVendedorPorId, criarVendedor } from "../repository/vendedorRepository";
import { updateProduto } from "../repository/produtosRepository";
import bcrypt from "bcrypt";

const route = Router();

route.get('/vendedor', async (req, res) => {
    try {
        const listaVendedores = await buscarVedendores();

        return res.status(200).json({
            message: "Lista de vendedores cadastrados",
            vendedores: listaVendedores
        });

    } catch (error: any) {
        return res.status(400).json(
            {
                message: error.message
            }
        )
    }
});

route.get('/vendedor/:id', async (req, res) => {
    try{
        const { id } = req.params;

        const vendedor = await buscarVendedorPorId(id);

        return res.status(200).json({
            messsage: "Vendedor encvontado",
            vendedor: vendedor
        });

    } catch(error: any){

    }
})

route.post('/vendedor', async (req, res) => {
    try{
        const { id } = req.params;
        const {nome, cpf,email,  senhaHash, telefone, dataCadastro } = req.body;
        
        const saltos = 10;
        const senhaCriptografada = await bcrypt.hash(senhaHash, saltos);
        
        const vendedor = await criarVendedor(nome,cpf,email,senhaCriptografada,telefone,dataCadastro);
        

        return res.status(200).json({
            message: "Vendedor criado com sucesso",
            vendedor: vendedor
        });

    } catch(error: any){
        return res.status(422).json({
            message: error.message
        });

    }

});

route.put('/vendedor/:id', async (req, res) => {
    try {

        const { id } = req.params;

        const produtoAtualizado = await updateProduto(Number(id), req.body);

        return res.status(200).json({
                message: "Produto atualizado com sucesso!",
                produto: produtoAtualizado
        });
        
    } catch (error: any) {
        console.log(error);
        return res.status(422).json({
            message: error.message
        });
    }

});



export default route;