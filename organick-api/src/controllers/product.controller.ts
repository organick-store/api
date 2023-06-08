import { Body, Controller, Delete, Get, Post, Put, Res } from "@nestjs/common";
import { ProductService } from "../services/product.service";
import { ProductDTO } from "../DTOs/product.dto";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";

@Controller()
@ApiTags('Product CRUD')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('/products')
  @ApiResponse({ status: 200, description: 'Get all products' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAllProducts(@Res() res) {
    try {
      const products = await this.productService.getAllProducts();
      res.status(200).json({ status: 'Success', products });
    } catch (error) { 
      res.status(500).json({ status: 'Error', message: error.message });
    }
  }
  
  @Post('/product')
  @ApiResponse({ status: 200, description: 'Create product' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: ProductDTO })
  async createProduct(@Res() res, @Body() productInfo: ProductDTO) {
    try {
      const product = await this.productService.createProduct(productInfo);
      res.status(200).json({ status: 'Success', product });
    } catch (error) {
      res.status(500).json({ status: 'Error', message: error.message });
    }
  }

  @Put('/product/update')
  @ApiResponse({ status: 200, description: 'Update product' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: ProductDTO })
  async updateProduct(@Res() res, @Body() productInfo: ProductDTO) {
    try {
      const product = await this.productService.updateProduct(productInfo);
      if (product.status === 'Error') return res.status(500).json(product);
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ status: 'Error', message: error.message });
    }
  }

  @Delete('/product/delete')
  @ApiResponse({ status: 200, description: 'Delete product' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: String })
  async deleteProduct(@Res() res, @Body() productName: string) {
    try {
      const product = await this.productService.deleteProduct(productName);
      if (product.status === 'Error') return res.status(500).json(product);
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ status: 'Error', message: error.message });
    }
  }
}
