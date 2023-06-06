import { Body, Controller, Post, Res } from "@nestjs/common";
import { OrderService } from "../services/order.service";
import { OrderDTO } from "../DTOs/order.dto";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { EmailService } from "../services/email.service";

@Controller()
@ApiTags('Order creation')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly emailService: EmailService,
  ) {}

  @Post('order')
  @ApiResponse({ status: 201, description: 'Order created' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiBody({ type: OrderDTO })
  async createOrder(@Body() body: OrderDTO, @Res() res) {
    try {
      const { token, address, products, totalCost, totalDiscount } = body;
      const order = await this.orderService.createOrder(token, totalCost, totalDiscount, address, products);
      await this.emailService.sendOrderEmail(order.order.user.email, products, order.order.id, order.order.address);
      res.status(201).send(order);
    } catch (error) {
      res.status(500).send({ status: 'Server error', message: error.message });
    }
  }
}
