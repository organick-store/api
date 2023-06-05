import { Body, Controller, Delete, Get, Post, Put, Res } from "@nestjs/common";
import { ProductService } from "../services/product.service";
import { ProductDTO } from "../DTOs/product.dto";

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('/products')
  async getAllProducts(@Res() res) {
    try {
      const products = await this.productService.getAllProducts();
      res.status(200).json({ status: 'Success', products });
    } catch (error) { 
      res.status(500).json({ status: 'Error', message: error.message });
    }
  }
  
  @Post('/product')
  async createProduct(@Res() res, @Body() productInfo: ProductDTO) {
    try {
      const product = await this.productService.createProduct(productInfo);
      res.status(200).json({ status: 'Success', product });
    } catch (error) {
      res.status(500).json({ status: 'Error', message: error.message });
    }
  }

  @Put('/product/update')
  async updateProduct(@Res() res, @Body() productInfo: ProductDTO) {
    try {
      const product = await this.productService.updateProduct(productInfo);
      res.status(200).json({ status: 'Success', product });
    } catch (error) {
      res.status(500).json({ status: 'Error', message: error.message });
    }
  }

  @Delete('/product/delete')
  async deleteProduct(@Res() res, @Body() productName: string) {
    try {
      const product = await this.productService.deleteProduct(productName);
      res.status(200).json({ status: 'Success', product });
    } catch (error) {
      res.status(500).json({ status: 'Error', message: error.message });
    }
  }
}
