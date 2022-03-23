import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { extname, join } from 'path';
import * as sharp from 'sharp';
import { randomUUID } from 'crypto';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/users/roles.decorator';
import { RolesGuard } from 'src/users/roles.guard';
import {
  CreateProductDto,
  EditProductParamDto,
  UpdateProductDTO,
  UploadProductImageDto,
} from './dto';
import { ProductsService } from './products.service';
import { imagesPath } from '../config';
import { setTimeout } from 'timers/promises';

const storageOptions = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const randomName = uuidv4();
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param() { id }: EditProductParamDto) {
    await this.productsService.deleteProduct(id);
    return;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async edit(
    @Param() { id }: EditProductParamDto,
    @Body() { active, description, name, price, stock }: UpdateProductDTO,
  ) {
    if (!active && !description && !name && !price && !stock) {
      throw new UnauthorizedException('Me dê pelo menos um valor válido.');
    }
    return await this.productsService.editProduct(
      { active, description, name, price, stock },
      id,
    );
  }

  @Get()
  async list() {
    return await this.productsService.listProducts();
  }

  @Post('upload/image/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: storageOptions,
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
          throw new HttpException('Apenas imagens são permitidas', 403);
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @Roles(UserRole.ADMIN)
  async uploadImage(
    @Param() { id }: UploadProductImageDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    try {
      const filePath = 'http://localhost:3000/img/' + file.filename;
      const newProduct = await this.productsService.uploadImage(id, filePath);

      sharp(file.filename).resize(200, 200);

      return newProduct;
    } catch (error) {
      fs.unlinkSync(file.path);
      req.next(error);
    }
  }
}
