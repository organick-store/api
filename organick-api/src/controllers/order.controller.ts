import { Body, Controller, Post, Res } from "@nestjs/common";
import { OrderService } from "../services/order.service";
import { OrderDTO } from "../DTOs/order.dto";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { OrderProduct } from "../entities/orderProduct.entity";

@Controller()
@ApiTags('Order creation')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
  ) {}

  @Post('order')
  @ApiResponse({ status: 201, description: 'Order created' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiBody({ type: OrderDTO })
  async createOrder(@Body() body: OrderDTO, @Res() res) {
    try {
      const { token, address, products, totalCost, totalDiscount } = body;
      const order = await this.orderService.createOrder(token, totalCost, totalDiscount, address, products);

      res.status(201).send(order);
    } catch (error) {
      res.status(500).send({ status: 'Server error', message: error.message });
    }
  }
}
