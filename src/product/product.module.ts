import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';

@Module({
  exports: [ProductService],
  providers: [ProductService],
  controllers: [ProductController],
  imports: [
    TypeOrmModule.forFeature([Product]),
  ]
})
export class ProductModule {}
