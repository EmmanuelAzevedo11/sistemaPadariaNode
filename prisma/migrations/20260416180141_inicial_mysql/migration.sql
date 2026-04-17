-- CreateTable
CREATE TABLE `vendedores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `cpf` VARCHAR(14) NOT NULL,
    `email` VARCHAR(80) NOT NULL,
    `senhaHash` VARCHAR(255) NOT NULL,
    `telefone` VARCHAR(20) NOT NULL,
    `dataCadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomeCategoria` VARCHAR(100) NOT NULL,
    `descricao` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produtos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `código` VARCHAR(20) NOT NULL,
    `nomeProduto` VARCHAR(100) NOT NULL,
    `preco` DECIMAL(10, 2) NOT NULL,
    `categoriaId` INTEGER NOT NULL,
    `estoque` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clientes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomeCliente` VARCHAR(100) NOT NULL,
    `cpf` VARCHAR(14) NOT NULL,
    `telefone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(80) NOT NULL,
    `dataCadastro` DATE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `formaPagamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(30) NOT NULL,

    UNIQUE INDEX `formaPagamento_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `valorTotalBruto` DECIMAL(10, 2) NOT NULL,
    `descontoAplicado` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `valorTotalLiquido` DECIMAL(10, 2) NOT NULL,
    `cpfNotaFiscal` VARCHAR(14) NULL,
    `dataHoraVenda` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `vendedorId` INTEGER NOT NULL,
    `clienteId` INTEGER NULL,
    `formaPagamentoId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itensVenda` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantidade` DECIMAL(10, 3) NOT NULL,
    `precoUnitario` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `vendaId` INTEGER NOT NULL,
    `produtoId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `produtos` ADD CONSTRAINT `produtos_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendas` ADD CONSTRAINT `vendas_vendedorId_fkey` FOREIGN KEY (`vendedorId`) REFERENCES `vendedores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendas` ADD CONSTRAINT `vendas_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendas` ADD CONSTRAINT `vendas_formaPagamentoId_fkey` FOREIGN KEY (`formaPagamentoId`) REFERENCES `formaPagamento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itensVenda` ADD CONSTRAINT `itensVenda_vendaId_fkey` FOREIGN KEY (`vendaId`) REFERENCES `vendas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itensVenda` ADD CONSTRAINT `itensVenda_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `produtos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
