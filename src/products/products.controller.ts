/* eslint-disable @typescript-eslint/no-empty-function */
import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/users/roles.decorator';
import { RolesGuard } from 'src/users/roles.guard';
import {
  CreateProductDto,
  EditProductDto,
  EditProductParamDto,
  UploadProductImageDto,
} from './dto';
import { ProductsService } from './products.service';

const storageOptions = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    // Generating a 32 random chars long string
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    //Calling the callback passing the random name generated with the original extension name
    cb(null, `${randomName}${extname(file.originalname)}`);
  },
});

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() body: CreateProductDto) {
    return await this.productsService.createProduct(body);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Query() { id }: EditProductParamDto) {
    return await this.productsService.deleteProduct(id);
  }

  @Patch('edit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async edit(
    @Query() { id }: EditProductParamDto,
    @Body() body: EditProductDto,
  ) {
    return await this.productsService.editProduct(body, id);
  }

  @Get()
  async list() {
    return await this.productsService.listProducts();
  }

  @Post('upload/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: storageOptions,
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @Roles(UserRole.ADMIN)
  async uploadImage(
    @Query() { id }: UploadProductImageDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const filePath = 'http://localhost:3000/img/' + file.filename;
    return await this.productsService.uploadImage(id, filePath);
  }
}
