import * as crypto from 'crypto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { OrderProductService } from '../services/product-order.service';
import { IOrderProductEntity } from '../inrerfaces/order-product-entity.interface';
import { Order } from '../enrtities/order.entity';
import { OrderService } from '../services/order.service';
import { MailService } from '../../mail/services/mail.service';
import { UserService } from '../../user/services/user.service';
import { ProductService } from '../../product/product.service';
import { ICreateOrder } from '../inrerfaces/create-order.interface';
import { generateRandomUser } from '../../user/tests/utils/generate-random-user.util';
import { User } from '../../user/entities/user.entity';
import { generateRandomOrder } from './utils/generate-random-order.util';
import { IProductEntity } from '../../product/interfaces/product-entity.interface';
import { generateRandomProduct } from '../../product/tests/utils/generate-random-product.util';
import { generateRandomOrderProduct } from './utils/generate-random-order-product.util';

describe('OrderService', () => {
  let service: OrderService;
  let mailService: MailService;
  let userService: UserService;
  let productService: ProductService;
  let orderRepository: Repository<Order>;
  let orderProductService: OrderProductService;

  const ORDER_REPO_TOKEN = getRepositoryToken(Order);

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: ORDER_REPO_TOKEN,
          useValue: {
            save: jest.fn(),
            create: jest.fn()
          }
        },
        {
          provide: MailService,
          useValue: {
            sendInvoice: jest.fn()
          }
        },
        {
          provide: UserService,
          useValue: {
            find: jest.fn(),
            update: jest.fn(),
            create: jest.fn()
          }
        },
        {
          provide: OrderProductService,
          useValue: {
            create: jest.fn()
          }
        },
        {
          provide: ProductService,
          useValue: {
            findById: jest.fn()
          }
        }
      ]
    }).compile();

    mailService = moduleRef.get(MailService);
    userService = moduleRef.get(UserService);
    productService = moduleRef.get(ProductService);
    orderRepository = moduleRef.get(ORDER_REPO_TOKEN);
    service = moduleRef.get<OrderService>(OrderService);
    orderProductService = moduleRef.get(OrderProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create order', async () => {
      const payload: ICreateOrder = {
        totalCost: crypto.randomInt(5, 10),
        totalDiscount: crypto.randomInt(5, 10),
        email: crypto.randomBytes(5).toString('hex'),
        address: crypto.randomBytes(5).toString('hex'),
        products: [
          {
            id: crypto.randomInt(5, 10),
            quantity: crypto.randomInt(5, 10)
          },
          {
            id: crypto.randomInt(5, 10),
            quantity: crypto.randomInt(5, 10)
          }
        ]
      };

      const user = generateRandomUser({ email: payload.email }) as User;
      const products: IProductEntity[] = [
        generateRandomProduct({ id: payload.products[0].id }),
        generateRandomProduct({ id: payload.products[1].id })
      ];
      const order = generateRandomOrder({
        userId: user.id,
        address: payload.address,
        totalCost: payload.totalCost,
        totalDiscount: payload.totalDiscount
      }) as Order;
      const orderProducts: IOrderProductEntity[] = [
        generateRandomOrderProduct({
          orderId: order.id,
          productId: products[0].id,
          quantity: payload.products[0].quantity
        }),
        generateRandomOrderProduct({
          orderId: order.id,
          productId: products[1].id,
          quantity: payload.products[1].quantity
        })
      ];

      jest.spyOn(userService, 'find').mockResolvedValue(user);
      jest.spyOn(orderRepository, 'create').mockReturnValue(order);
      jest.spyOn(orderRepository, 'save').mockResolvedValue(order);
      for (let i = 0; i < payload.products.length; i++) {
        jest
          .spyOn(productService, 'findById')
          .mockResolvedValueOnce(products[i]);
        jest
          .spyOn(orderProductService, 'create')
          .mockResolvedValueOnce(orderProducts[i]);
      }
      jest.spyOn(mailService, 'sendInvoice').mockResolvedValue(undefined);

      const result = await service.create(payload);

      expect(userService.find).toBeCalledTimes(1);
      expect(userService.find).toBeCalledWith({
        where: {
          email: payload.email
        }
      });

      expect(orderRepository.create).toBeCalledTimes(1);
      expect(orderRepository.create).toBeCalledWith({
        userId: user.id,
        address: payload.address,
        orderDate: expect.any(Date),
        totalCost: payload.totalCost,
        totalDiscount: payload.totalDiscount
      });

      expect(orderRepository.save).toBeCalledTimes(1);
      expect(orderRepository.save).toBeCalledWith(order);

      expect(productService.findById).toBeCalledTimes(2);
      expect(productService.findById).toBeCalledWith(payload.products[0].id);
      expect(productService.findById).toBeCalledWith(payload.products[1].id);

      expect(orderProductService.create).toBeCalledTimes(2);
      expect(orderProductService.create).toBeCalledWith({
        orderId: order.id,
        productId: products[0].id,
        quantity: payload.products[0].quantity
      });
      expect(orderProductService.create).toBeCalledWith({
        orderId: order.id,
        productId: products[1].id,
        quantity: payload.products[1].quantity
      });

      expect(mailService.sendInvoice).toBeCalledTimes(1);
      expect(mailService.sendInvoice).toBeCalledWith({
        email: payload.email,
        invoice: {
          address: payload.address,
          products: [
            {
              name: products[0].name,
              quantity: payload.products[0].quantity
            },
            {
              name: products[1].name,
              quantity: payload.products[1].quantity
            }
          ]
        }
      });

      expect(result).toEqual(order);
    });
  });
});
