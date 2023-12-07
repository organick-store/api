import * as crypto from 'crypto';

export const generateRandomOrder = () => {
  return {
    updatedAt: new Date(),
    createdAt: new Date(),
    id: crypto.randomInt(10),
    userId: crypto.randomInt(10),
    totalPrice: crypto.randomInt(10),
    status: crypto.randomBytes(16).toString('hex')
  };
};
