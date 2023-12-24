import * as crypto from 'crypto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { OrderProductService } from '../services/product-order.service';
import { OrderProduct } from '../enrtities/order-product.entity';
import { IOrderProductEntity } from '../inrerfaces/order-product-entity.interface';

describe('OrderProductService', () => {
  let service: OrderProductService;
  let orderProductRepository: Repository<OrderProduct>;

  const ORDER_PRODUCT_REPO_TOKEN = getRepositoryToken(OrderProduct);

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        OrderProductService,
        {
          provide: ORDER_PRODUCT_REPO_TOKEN,
          useValue: {
            save: jest.fn(),
            create: jest.fn()
          }
        }
      ]
    }).compile();

    orderProductRepository = moduleRef.get(ORDER_PRODUCT_REPO_TOKEN);
    service = moduleRef.get<OrderProductService>(OrderProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create order product', async () => {
      const payload = {
        quantity: 1,
        orderId: crypto.randomInt(5, 10),
        productId: crypto.randomInt(5, 10)
      };

      const orderProduct: IOrderProductEntity = {
        orderId: payload.orderId,
        quantity: payload.quantity,
        productId: payload.productId
      };

      jest
        .spyOn(orderProductRepository, 'create')
        .mockReturnValue(orderProduct as OrderProduct);
      jest
        .spyOn(orderProductRepository, 'save')
        .mockResolvedValue(orderProduct as OrderProduct);

      const result = await service.create(payload);

      expect(orderProductRepository.create).toBeCalledTimes(1);
      expect(orderProductRepository.create).toBeCalledWith(payload);

      expect(orderProductRepository.save).toBeCalledTimes(1);
      expect(orderProductRepository.save).toBeCalledWith(orderProduct);

      expect(result).toEqual(orderProduct);
    });
  });
});
