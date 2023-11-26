import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from '../entities/product.entity';
import { ProductService } from '../services/product.service';
import { generateRandomProduct } from './utils/generate-random-product.util';

describe('ProductService', () => {
  let service: ProductService;
  let productReposiroty: Repository<Product>;

  const PRODUCT_REPO_TOKEN = getRepositoryToken(Product);

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PRODUCT_REPO_TOKEN,
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
            findOneBy: jest.fn(),
          }
        }
      ]
    }).compile();

    productReposiroty = moduleRef.get(PRODUCT_REPO_TOKEN);
    service = moduleRef.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(productReposiroty).toBeDefined();
  });

  describe('getAllProducts', () => {
    it('should get all products', async () => {
      const randomProducts = [
        generateRandomProduct(),
        generateRandomProduct(),
        generateRandomProduct(),
      ];

      jest.spyOn(productReposiroty, 'find').mockResolvedValue(randomProducts);

      const result = await service.getAllProducts();

      expect(productReposiroty.find).toBeCalledTimes(1);
      expect(productReposiroty.find).toBeCalledWith();

      expect(result).toBe(randomProducts);
    });

    it('should throw internal repository error', async () => {
      const error = new Error('internal repository error');

      jest.spyOn(productReposiroty, 'find').mockRejectedValue(error);

      await expect(
        service.getAllProducts()
      ).rejects.toThrow(error);

      expect(productReposiroty.find).toBeCalledTimes(1);
      expect(productReposiroty.find).toBeCalledWith();
    });
  });

  describe('createProduct', () => {
    it('should create product', async () => {
      await service.createProduct({
        name: 'name',
        type: 'type',
        price: 10,
        discount: 10,
        image: 'image',
        description: 'description',
        additionalInfo: 'additionalInfo',
        overview: 'overview'
      });
      expect(productReposiroty.save).toBeCalledTimes(1);
    });
  });

  describe('updateProduct', () => {
    it('should update product', async () => {
      await service.updateProduct({
        name: 'name',
        type: 'type',
        price: 10,
        discount: 10,
        image: 'image',
        description: 'description',
        additionalInfo: 'additionalInfo',
        overview: 'overview'
      });
      expect(productReposiroty.update).toBeCalledTimes(0);
    });
  });

  describe('updateProduct', () => {
    it('should update product', async () => {
      const product = await service.updateProduct({
        name: 'name',
        type: 'type',
        price: 10,
        discount: 10,
        image: 'image',
        description: 'description',
        additionalInfo: 'additionalInfo',
        overview: 'overview'
      });
      expect(product).toMatchObject({ status: 'Error', message: 'Product not found' });
    });
  });

  describe('deleteProduct', () => {
    it('should delete product', async () => {
      await service.deleteProduct('name');
      expect(productReposiroty.delete).toBeCalledTimes(0);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product', async () => {
      const product = await service.deleteProduct('name');
      expect(product).toMatchObject({ status: 'Error', message: 'Product not found' });
    });
  });
});
