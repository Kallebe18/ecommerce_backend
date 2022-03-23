import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateProductDto, UpdateProductDTO } from './dto';

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

  async findById(id: string) {
    return this.prisma.product.findUnique({
      where: {
        id,
      },
    });
  }

  async editProduct(product: UpdateProductDTO, id: string) {
    const productExists = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!productExists) {
      throw new ForbiddenException('O produto não existe');
    }

    return await this.prisma.product.update({
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
    return this.prisma.product.findMany({
      where: {
        stock: {
          gt: 0,
        },
      },
    });
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
