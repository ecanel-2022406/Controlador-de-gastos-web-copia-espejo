/*
  Warnings:

  - You are about to drop the `categorias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `movimientos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "movimientos" DROP CONSTRAINT "movimientos_productoId_fkey";

-- DropForeignKey
ALTER TABLE "productos" DROP CONSTRAINT "productos_categoriaId_fkey";

-- DropTable
DROP TABLE "categorias";

-- DropTable
DROP TABLE "movimientos";

-- DropTable
DROP TABLE "productos";

-- DropEnum
DROP TYPE "TipoMovimiento";

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gastos" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "categoria" VARCHAR(100) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "gastos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
