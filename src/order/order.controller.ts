import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { JWTPayload } from 'src/authorization/decorators/jwt-payload.decorator';
import { AuthorizationGuard } from 'src/authorization/guards/authorization.guard';
import { IJWTPayload } from 'src/authorization/interfaces/jwt-payload.interface';
import { CreateOrderSchema } from './schemas/create-order.schema';
import { OrderService } from './services/order.service';
import { Response } from 'express';

@Controller('api/order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
  ) {}

  @Post('create')
  @UseGuards(AuthorizationGuard)
  public async create(
    @Body() schema: CreateOrderSchema,
    @JWTPayload() jwtPayload: IJWTPayload,
    @Res() res: Response,
  ): Promise<void> {
    const order = await this.orderService.create({
      ...schema,
      email: jwtPayload.sub,
    });

    res.send({ order })
  }
}
