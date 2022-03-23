-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('CREATED', 'SEPARATION', 'DONE');

-- DropForeignKey
ALTER TABLE "orders_products" DROP CONSTRAINT "orders_products_product_id_fkey";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT E'CREATED';

-- AddForeignKey
ALTER TABLE "orders_products" ADD CONSTRAINT "orders_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
