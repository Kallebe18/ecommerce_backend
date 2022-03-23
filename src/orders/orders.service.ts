import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';
import { CreateOrderDto } from './dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private productsService: ProductsService,
  ) {}

  async create({ products }: CreateOrderDto, userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new HttpException('Usuário inválido.', 403);
    }

    const orderProducts = [];

    await Promise.all(
      products.map(async ({ amount, id }) => {
        const productExists = await this.productsService.findById(id);
        if (!productExists) {
          throw new HttpException(`O produto de id ${id} não existe.`, 403);
        }

        if (amount > productExists.stock) {
          throw new HttpException(
            `Estoque insuficiente para ${productExists.name}.`,
            403,
          );
        }

        // UPDATE PRODUCT STOCK
        await this.productsService.editProduct(
          {
            stock: productExists.stock - amount,
          },
          productExists.id,
        );

        orderProducts.push({
          ...productExists,
          amount,
        });
      }),
    );

    await this.prisma.order.create({
      data: {
        buyer: {
          connect: {
            id: userId,
          },
        },
        products: {
          create: orderProducts.map((product) => ({
            productId: product.id,
            amount: product.amount,
            price: product.price,
          })),
        },
      },
    });
  }

  async list(userId: string) {
    return await this.prisma.order.findMany({
      where: {
        buyerId: userId,
      },
      select: {
        id: true,
        products: {
          select: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                discount: true,
                imageUrl: true,
              },
            },
            amount: true,
            price: true,
          },
        },
      },
    });
  }
}
