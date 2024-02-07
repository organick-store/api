import * as crypto from 'crypto';
import { IOrderEntity } from '../../inrerfaces/order-entity.interface';

export const generateRandomOrder = (
  partial?: Partial<IOrderEntity>
): IOrderEntity => {
  const random = {
    orderDate: new Date(),
    id: crypto.randomInt(5, 10),
    userId: crypto.randomInt(5, 10),
    totalCost: crypto.randomInt(100, 150),
    totalDiscount: crypto.randomInt(10, 15),
    address: crypto.randomBytes(5).toString('hex')
  };

  Object.assign(random, partial);

  return random;
};
