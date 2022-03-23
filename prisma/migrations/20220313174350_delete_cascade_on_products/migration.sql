-- DropForeignKey
ALTER TABLE "orders_products" DROP CONSTRAINT "orders_products_product_id_fkey";

-- AddForeignKey
ALTER TABLE "orders_products" ADD CONSTRAINT "orders_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
