import * as crypto from 'crypto';
import { IOrderProductEntity } from '../../inrerfaces/order-product-entity.interface';

export const generateRandomOrderProduct = (
  partial?: Partial<IOrderProductEntity>
): IOrderProductEntity => {
  const random: IOrderProductEntity = {
    orderId: crypto.randomInt(1, 5),
    quantity: crypto.randomInt(1, 5),
    productId: crypto.randomInt(1, 5)
  };

  Object.assign(random, partial);

  return random;
};
