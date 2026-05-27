import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { buscarVedendores, buscarVendedorPorEmail } from "../repository/vendedorRepository";

const JWT_SECRET = process.env.JWT_SECRET || "flamengo";

export const autenticadorEmail = async (email: string, senhaDigitada: string) => {
    const vendedor = await buscarVendedorPorEmail(email);

    const senhaValidada = await bcrypt.compare(senhaDigitada, vendedor.senhaHash);

    if(!senhaValidada){
        throw new Error("Login incorreto");
    }

    const token = jwt.sign(
        {id: vendedor.id, email: vendedor.email},
        JWT_SECRET,
        {expiresIn: '1d'}
    );

    const { senhaHash, ...vendedorSemSenha } = vendedor;
    return { vendedor: vendedorSemSenha, token };
}