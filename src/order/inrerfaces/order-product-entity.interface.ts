import { Product } from 'src/product/entities/product.entity';
import { Order } from '../enrtities/order.entity';
import { IOrderEntity } from './order-entity.interface';

export interface IOrderProductEntity {
  readonly quantity: number;

  readonly productId: number;

  readonly orderId: number;
}