/*
  Warnings:

  - You are about to drop the column `discount` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "discount",
DROP COLUMN "total";

-- AlterTable
ALTER TABLE "orders_products" ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0;
