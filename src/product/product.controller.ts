import { Controller, Get, Query, Res } from '@nestjs/common';
import { ProductService } from './product.service';
import { Response } from 'express';
import { GetAllProductsSchema } from './schemas/get-all-products.schema';

@Controller('api/product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
  ) {}

  @Get('all')
  public async getAllProducts(
    @Res() res: Response,
    @Query() query?: GetAllProductsSchema,
  ): Promise<void> {
    const products = await this.productService.findAndCountMany(
      query.limit,
      query.offset,
    );

    res.send(products);
  }
}
