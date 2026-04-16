import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

console.log("--- TESTE DE AMBIENTE ---");
console.log("URL DO BANCO:", process.env.DATABASE_URL);
console.log("-------------------------");

export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Isso vai nos ajudar a ver o que acontece no terminal
});