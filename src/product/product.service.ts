import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/product/entities/product.entity';
import { In, Repository } from 'typeorm';
import { ICountedProducts } from './interfaces/counted-products.interface';
import { IProductEntity } from './interfaces/product-entity.interface';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  public async findAndCountMany(limit?: number, offset?: number): Promise<ICountedProducts> {
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
    });

    return { 
      products,
      count: products.length
    };
  }

  public async findById(id: number): Promise<IProductEntity> {
    return this.productRepository.findOne({
      where: {
        id,
      }
    });
  }
}
