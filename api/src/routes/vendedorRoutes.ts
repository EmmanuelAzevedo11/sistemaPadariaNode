import { Router } from "express";
import { buscarVedendores, buscarVendedorPorId, criarVendedor, deleteVendedor, updateVendedor } from "../repository/vendedorRepository";
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
        const {nome, cpf,email,  senhaHash, telefone } = req.body;
        
        const saltos = 10;
        const senhaCriptografada = await bcrypt.hash(senhaHash, saltos);
        const dataCadastro = new Date();
        
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

        const vendedorAtualizado = await updateVendedor(Number(id), req.body);

        return res.status(200).json({
                message: "Vendedor atualizado com sucesso!",
                vendedor: vendedorAtualizado
        });
        
    } catch (error: any) {
        console.log(error);
        return res.status(422).json({
            message: error.message
        });
    }

});

route.delete('/vendedor/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const vendedorExcluido = await deleteVendedor(id);

        if(vendedorExcluido){
            return res.status(200).json({
                message: 'Vendedor excluido com sucesso',
            });
        }

    } catch (error) {
        return res.status(500).json({
            message: "Erro ao excluir vendedor"
        });
    }
})


export default route;