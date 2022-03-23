import {
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @IsNotEmpty()
  @MaxLength(300)
  description: string;

  @IsNotEmpty()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @Min(0)
  stock: number;

  @IsNotEmpty()
  active: boolean;
}

export class UpdateProductDTO {
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  @MaxLength(300)
  description?: string;

  @IsOptional()
  @IsNotEmpty()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNotEmpty()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsNotEmpty()
  active?: boolean;
}

export class EditProductParamDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class UploadProductImageDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
