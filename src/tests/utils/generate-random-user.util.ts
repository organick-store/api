import * as crypto from 'crypto';
import { User } from 'src/entities/user.entity';

export const generateRandomUser = () => {
  return {
    isVerified: false,
    id: crypto.randomInt(10),
    name: crypto.randomBytes(16).toString('hex'),
    phone: crypto.randomBytes(16).toString('hex'),
    email: crypto.randomBytes(16).toString('hex'),
    address: crypto.randomBytes(16).toString('hex'),
    password: crypto.randomBytes(16).toString('hex')
  };
};
