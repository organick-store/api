import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Order } from '../entities/order.entity';
import { Product } from '../entities/product.entity';
import { OrderService } from '../services/order.service';
import { OrderProduct } from '../entities/orderProduct.entity';
import { generateRandomUser } from './utils/generate-random-user.util';
import { generateRandomProduct } from './utils/generate-random-product.util';

describe('OrderService', () => {
  let service: OrderService;
  let userReposiroty: Repository<User>;
  let orderReposiroty: Repository<Order>;
  let productReposiroty: Repository<Product>;
  let orderProductReposiroty: Repository<OrderProduct>;

  const PRODUCT_REPO_TOKEN = getRepositoryToken(Product);
  const ORDER_REPO_TOKEN = getRepositoryToken(Order);
  const ORDER_PRODUCT_REPO_TOKEN = getRepositoryToken(OrderProduct);
  const USER_REPO_TOKEN = getRepositoryToken(User);

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PRODUCT_REPO_TOKEN,
          useValue: {
            findOneBy: jest.fn()
          }
        },
        {
          provide: ORDER_REPO_TOKEN,
          useValue: {
            save: jest.fn(),
            findOneBy: jest.fn()
          }
        },
        {
          provide: ORDER_PRODUCT_REPO_TOKEN,
          useValue: {
            save: jest.fn()
          }
        },
        {
          provide: USER_REPO_TOKEN,
          useValue: {
            findOneBy: jest.fn()
          }
        }
      ]
    }).compile();

    userReposiroty = moduleRef.get(USER_REPO_TOKEN);
    orderReposiroty = moduleRef.get(ORDER_REPO_TOKEN);
    service = moduleRef.get<OrderService>(OrderService);
    productReposiroty = moduleRef.get(PRODUCT_REPO_TOKEN);
    orderProductReposiroty = moduleRef.get(ORDER_PRODUCT_REPO_TOKEN);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order', async () => {
      const randomUser = generateRandomUser();

      const totalDiscount = 0;
      const totalCost = crypto.randomInt(90, 100);
      const token = crypto.randomBytes(16).toString('hex');
      const address = crypto.randomBytes(16).toString('hex');
      const products = [
        {
          quantity: 1,
          name: crypto.randomBytes(4).toString('hex')
        },
        {
          quantity: 2,
          name: crypto.randomBytes(4).toString('hex')
        }
      ];

      const tokenUtils = require('../utils/token.util');

      jest.spyOn(tokenUtils, 'verifyToken').mockResolvedValue(true);
      jest.spyOn(tokenUtils, 'decodeToken').mockResolvedValue({
        email: randomUser.email
      });
      jest
        .spyOn(userReposiroty, 'findOneBy')
        .mockResolvedValue(randomUser as User);
      jest.spyOn(orderReposiroty, 'save').mockResolvedValue({
        address,
        totalCost,
        products: [],
        totalDiscount,
        user: randomUser as User,
        orderDate: expect.any(Date),
        id: crypto.randomInt(1, 100)
      });
      jest.spyOn(service, 'addProductToOrder').mockResolvedValue(undefined);

      const order = await service.createOrder(
        token,
        totalCost,
        totalDiscount,
        address,
        products
      );

      expect(tokenUtils.verifyToken).toBeCalledTimes(1);
      expect(tokenUtils.verifyToken).toBeCalledWith(token);

      expect(tokenUtils.decodeToken).toBeCalledTimes(1);
      expect(tokenUtils.decodeToken).toBeCalledWith(token);

      expect(userReposiroty.findOneBy).toBeCalledTimes(1);
      expect(userReposiroty.findOneBy).toBeCalledWith({
        email: randomUser.email
      });

      expect(orderReposiroty.save).toBeCalledTimes(1);
      expect(orderReposiroty.save).toBeCalledWith({
        address,
        totalCost,
        totalDiscount,
        user: randomUser,
        orderDate: expect.any(Date)
      });

      expect(service.addProductToOrder).toBeCalledTimes(1);
      expect(service.addProductToOrder).toBeCalledWith(undefined, products);

      expect(order).toEqual({
        status: 'Success',
        message: 'Order created',
        order: {
          address,
          totalCost,
          totalDiscount,
          user: randomUser,
          orderDate: expect.any(Date)
        }
      });
    });

    it('should return error if token is invalid', async () => {
      const totalDiscount = 0;
      const totalCost = crypto.randomInt(90, 100);
      const token = crypto.randomBytes(16).toString('hex');
      const address = crypto.randomBytes(16).toString('hex');
      const products = [
        {
          quantity: 1,
          name: crypto.randomBytes(4).toString('hex')
        },
        {
          quantity: 2,
          name: crypto.randomBytes(4).toString('hex')
        }
      ];

      const tokenUtils = require('../utils/token.util');

      jest.spyOn(tokenUtils, 'verifyToken').mockResolvedValue(false);
      jest.spyOn(service, 'addProductToOrder');

      const order = await service.createOrder(
        token,
        totalCost,
        totalDiscount,
        address,
        products
      );

      expect(tokenUtils.verifyToken).toBeCalledTimes(1);
      expect(tokenUtils.verifyToken).toBeCalledWith(token);

      expect(tokenUtils.decodeToken).toBeCalledTimes(0);

      expect(userReposiroty.findOneBy).toBeCalledTimes(0);

      expect(orderReposiroty.save).toBeCalledTimes(0);

      expect(service.addProductToOrder).toBeCalledTimes(0);

      expect(order).toEqual({
        status: 'Error',
        message: 'Invalid token'
      });
    });

    it('should return error if user not found', async () => {
      const randomUser = generateRandomUser();

      const totalDiscount = 0;
      const totalCost = crypto.randomInt(90, 100);
      const token = crypto.randomBytes(16).toString('hex');
      const address = crypto.randomBytes(16).toString('hex');
      const products = [
        {
          quantity: 1,
          name: crypto.randomBytes(4).toString('hex')
        },
        {
          quantity: 2,
          name: crypto.randomBytes(4).toString('hex')
        }
      ];

      const tokenUtils = require('../utils/token.util');

      jest.spyOn(tokenUtils, 'verifyToken').mockResolvedValue(true);
      jest.spyOn(tokenUtils, 'decodeToken').mockResolvedValue({
        email: randomUser.email
      });
      jest.spyOn(userReposiroty, 'findOneBy').mockResolvedValue(null);
      jest.spyOn(service, 'addProductToOrder');

      const order = await service.createOrder(
        token,
        totalCost,
        totalDiscount,
        address,
        products
      );

      expect(tokenUtils.verifyToken).toBeCalledTimes(1);
      expect(tokenUtils.verifyToken).toBeCalledWith(token);

      expect(tokenUtils.decodeToken).toBeCalledTimes(1);
      expect(tokenUtils.decodeToken).toBeCalledWith(token);

      expect(userReposiroty.findOneBy).toBeCalledTimes(1);
      expect(userReposiroty.findOneBy).toBeCalledWith({
        email: randomUser.email
      });

      expect(orderReposiroty.save).toBeCalledTimes(0);

      expect(service.addProductToOrder).toBeCalledTimes(0);

      expect(order).toEqual({
        status: 'Error',
        message: 'User not found'
      });
    });
  });

  describe('addProductToOrder', () => {
    it('should add product to order', async () => {
      const randomOrder = {
        id: crypto.randomInt(1, 100)
      };
      const randomProduct = generateRandomProduct();
      const randomOrderProduct = {
        quantity: crypto.randomInt(1, 100),
        product: [randomProduct as Product],
        order: randomOrder
      };

      jest
        .spyOn(orderReposiroty, 'findOneBy')
        .mockResolvedValue(randomOrder as Order);
      jest
        .spyOn(productReposiroty, 'findOneBy')
        .mockResolvedValue(randomProduct);
      jest
        .spyOn(orderProductReposiroty, 'save')
        .mockResolvedValue(expect.any(OrderProduct));

      await service.addProductToOrder(randomOrder.id, [randomProduct]);

      expect(orderReposiroty.findOneBy).toBeCalledTimes(1);
      expect(orderReposiroty.findOneBy).toBeCalledWith({ id: randomOrder.id });

      expect(productReposiroty.findOneBy).toBeCalledTimes(1);
      expect(productReposiroty.findOneBy).toBeCalledWith({
        name: randomProduct.name
      });

      expect(orderProductReposiroty.save).toBeCalledTimes(1);
    });
  });
});
