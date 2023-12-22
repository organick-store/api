import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderProduct } from 'src/order/enrtities/order-product.entity';
import { Repository } from 'typeorm';
import { IOrderProductEntity } from '../inrerfaces/order-product-entity.interface';

@Injectable()
export class OrderProductService {
  constructor(
    @InjectRepository(OrderProduct)
    private readonly orderProductRepository: Repository<OrderProduct>
  ) {}

  public async create(
    payload: IOrderProductEntity
  ): Promise<IOrderProductEntity> {
    const orderProduct = this.orderProductRepository.create({
      orderId: payload.orderId,
      quantity: payload.quantity,
      productId: payload.productId
    });

    return this.orderProductRepository.save(orderProduct);
  }
}
