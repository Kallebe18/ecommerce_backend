import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateProductDto, EditProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async createProduct(product: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        stock: product.stock,
        active: true,
        imageUrl: '',
        price: product.price,
      },
    });
  }

  async editProduct(product: EditProductDto, id: string) {
    return this.prisma.product.update({
      where: { id },
      data: product,
    });
  }

  async deleteProduct(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async listProducts() {
    return this.prisma.product.findMany();
  }

  async uploadImage(id: string, imagePath: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });
    if (!product) {
      throw new UnauthorizedException('produto não existe');
    }

    return await this.prisma.product.update({
      where: {
        id,
      },
      data: {
        imageUrl: imagePath,
      },
    });
  }
}
