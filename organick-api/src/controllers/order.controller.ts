import { Body, Controller, Post, Res } from "@nestjs/common";
import { OrderService } from "../services/order.service";
import { ProductService } from "../services/product.service";
import { OrderDTO } from "../DTOs/order.dto";
import { ApiBody, ApiResponse } from "@nestjs/swagger";
import { Product } from "../entities/product.entity";

@Controller()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly productService: ProductService
  ) {}

  @Post('order')
  @ApiResponse({ status: 201, description: 'Order created' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiBody({ type: OrderDTO })
  async createOrder(@Body() body: OrderDTO, @Res() res) {
    try {
      const orderedProducts = new Array<Product>();
      const { token, address, products, totalCost, totalDiscount } = body;
      for (const product of products) {
        const productFromDB = await this.productService.getProductByName(product);
        if (productFromDB.status === 'Error') return res.status(404).send(productFromDB);
        orderedProducts.push(productFromDB.product);
      }

      const order = await this.orderService.createOrder(token, totalCost, totalDiscount, address, orderedProducts);
      res.status(201).send(order);
    } catch (error) {
      res.status(500).send({ status: 'Server error', message: error.message });
    }
  }
}
