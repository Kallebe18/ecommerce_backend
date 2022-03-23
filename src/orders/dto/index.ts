import { IsNotEmpty } from 'class-validator';

interface OrderProduct {
  id: string;
  amount: number;
}

export class CreateOrderDto {
  @IsNotEmpty()
  products: OrderProduct[];
}
