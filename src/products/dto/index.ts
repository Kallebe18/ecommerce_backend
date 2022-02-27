import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  price: number;

  @IsNotEmpty()
  stock: number;
}

export class EditProductDto {
  @IsOptional()
  name: string;

  @IsOptional()
  description: string;

  @IsOptional()
  price: number;

  @IsOptional()
  stock: number;

  @IsOptional()
  imageUrl: string;

  @IsOptional()
  active: boolean;
}

export class EditProductParamDto {
  @IsNotEmpty()
  id: string;
}

export class UploadProductImageDto {
  @IsNotEmpty()
  id: string;
}
