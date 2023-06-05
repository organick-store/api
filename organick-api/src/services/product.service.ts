import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Product } from "../entities/product.entity";
import { ProductDTO } from "../DTOs/product.dto";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>
  ) {}

  async getAllProducts(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async createProduct(productInfo: ProductDTO): Promise<Product> {
    try {
      const product = new Product();
      product.name = productInfo.name;
      product.type = productInfo.type;
      product.price = productInfo.price;
      product.discount = productInfo.discount;
      product.image = productInfo.image;
      product.description = productInfo.description;
      product.additionalInfo  = productInfo.additionalInfo;
      product.overview = productInfo.overview;
      
      return await this.productRepository.save(product);
    } catch (error) {
      console.log(error);
    }
  }

  async updateProduct(productInfo: ProductDTO) {
    try {
      const product = await this.productRepository.findOneBy({ name: productInfo.name });
      if (!product) return { status: 'Error', message: 'Product not found' };

      const updated = await this.productRepository.update(product, productInfo);
      return { status: 'Success', updated }
    } catch (error) {
      console.log(error);
    }
  }

  async deleteProduct(productName: string) {
    try {
      const product = await this.productRepository.findOneBy({ name: productName });
      if (!product) return { status: 'Error', message: 'Product not found' };

      const deleted =  await this.productRepository.delete(product);
      return { status: 'Success', deleted }
    } catch (error) {
      console.log(error);
    }
  }
}