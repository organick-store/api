import * as crypto from 'crypto';

export const generateRandomProduct = () => {
  return {
    id: crypto.randomInt(10),
    price: crypto.randomInt(10),
    discount: crypto.randomInt(10),
    quantity: crypto.randomInt(10),
    name: crypto.randomBytes(16).toString('hex'),
    type: crypto.randomBytes(16).toString('hex'),
    image: crypto.randomBytes(16).toString('hex'),
    overview: crypto.randomBytes(32).toString('hex'),
    description: crypto.randomBytes(16).toString('hex'),
    additionalInfo: crypto.randomBytes(8).toString('hex')
  };
};
