import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateOrderDto } from './dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: CreateOrderDto, @Req() req) {
    return await this.ordersService.create(body, req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Req() req) {
    return await this.ordersService.list(req.user.userId);
  }
}
