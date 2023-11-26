import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';

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

  describe('getProductByName', () => {
    it('should get product by name', async () => {
      const randomProduct = generateRandomProduct();
      const name = randomProduct.name;

      jest.spyOn(productReposiroty, 'findOneBy').mockResolvedValue(randomProduct);

      const result = await service.getProductByName(name);

      expect(productReposiroty.findOneBy).toBeCalledTimes(1);
      expect(productReposiroty.findOneBy).toBeCalledWith({ name });

      expect(result).toEqual({ status: 'Success', product: randomProduct });
    });

    it('should throw product not found error', async () => {
      const name = crypto.randomBytes(16).toString('hex');
      const error = new Error('Product not found');

      jest.spyOn(productReposiroty, 'findOneBy').mockResolvedValue(null);

      const result = await service.getProductByName(name);

      expect(productReposiroty.findOneBy).toBeCalledTimes(1);
      expect(productReposiroty.findOneBy).toBeCalledWith({ name });

      expect(result).toEqual({ status: 'Error', message: error.message });
    });
  });

  describe('createProduct', () => {
    it('should create product', async () => {
      const { id, ...randomProduct } = generateRandomProduct();

      jest.spyOn(productReposiroty, 'save').mockResolvedValue({ 
        ...randomProduct,
        id, 
      });

      const result = await service.createProduct(randomProduct);

      expect(productReposiroty.save).toBeCalledTimes(1);
      expect(productReposiroty.save).toBeCalledWith(randomProduct);

      expect(result).toEqual({ id, ...randomProduct });
    });

    it('should throw internal repository error', async () => {
      const { id, ...randomProduct } = generateRandomProduct();
      const error = new Error('internal repository error');

      jest.spyOn(productReposiroty, 'save').mockRejectedValue(error);

      const result = await service.createProduct(randomProduct);

      expect(productReposiroty.save).toBeCalledTimes(1);
      expect(productReposiroty.save).toBeCalledWith(randomProduct);

      expect(result).toBeUndefined();
    });
  });

  describe('updateProduct', () => {
    it('should update product', async () => {
      const { id, ...randomProduct } = generateRandomProduct();

      jest.spyOn(productReposiroty, 'findOneBy').mockResolvedValue({ 
        ...randomProduct,
        id, 
      });

      jest.spyOn(productReposiroty, 'update').mockResolvedValue({
        raw: {},
        affected: 1,
        generatedMaps: [],
      });

      const result = await service.updateProduct(randomProduct);

      expect(productReposiroty.findOneBy).toBeCalledTimes(1);
      expect(productReposiroty.findOneBy).toBeCalledWith({ name: randomProduct.name });

      expect(productReposiroty.update).toBeCalledTimes(1);
      expect(productReposiroty.update).toBeCalledWith({ id, ...randomProduct }, randomProduct);

      expect(result).toEqual({ 
        status: 'Success', 
        updated: {
          raw: {},
          affected: 1,
          generatedMaps: [], 
        } ,
      });
    });

    it('should throw product not found error', async () => {
      const { id, ...randomProduct } = generateRandomProduct();
      const error = new Error('Product not found');

      jest.spyOn(productReposiroty, 'findOneBy').mockResolvedValue(null);

      const result = await service.updateProduct(randomProduct);

      expect(productReposiroty.findOneBy).toBeCalledTimes(1);
      expect(productReposiroty.findOneBy).toBeCalledWith({ name: randomProduct.name });

      expect(productReposiroty.update).toBeCalledTimes(0);

      expect(result).toEqual({ status: 'Error', message: error.message });
    });

    it('should throw internal repository error', async () => {
      const { id, ...randomProduct } = generateRandomProduct();
      const error = new Error('internal repository error');

      jest.spyOn(productReposiroty, 'findOneBy').mockResolvedValue({ 
        ...randomProduct,
        id, 
      });

      jest.spyOn(productReposiroty, 'update').mockRejectedValue(error);

      const result = await service.updateProduct(randomProduct);

      expect(productReposiroty.findOneBy).toBeCalledTimes(1);
      expect(productReposiroty.findOneBy).toBeCalledWith({ name: randomProduct.name });

      expect(productReposiroty.update).toBeCalledTimes(1);
      expect(productReposiroty.update).toBeCalledWith({ id, ...randomProduct }, randomProduct);

      expect(result).toBeUndefined();
    });
  });

  describe('deleteProduct', () => {
    it('should delete product', async () => {
      const { id, ...randomProduct } = generateRandomProduct();

      jest.spyOn(productReposiroty, 'findOneBy').mockResolvedValue({ 
        ...randomProduct,
        id, 
      });

      jest.spyOn(productReposiroty, 'delete').mockResolvedValue({
        raw: {},
        affected: 1,
      });

      const result = await service.deleteProduct(randomProduct.name);

      expect(productReposiroty.findOneBy).toBeCalledTimes(1);
      expect(productReposiroty.findOneBy).toBeCalledWith({ name: randomProduct.name });

      expect(productReposiroty.delete).toBeCalledTimes(1);
      expect(productReposiroty.delete).toBeCalledWith({ id, ...randomProduct });

      expect(result).toEqual({ 
        status: 'Success', 
        deleted: {
          raw: {},
          affected: 1,
        } ,
      });
    });

    it('should throw product not found error', async () => {
      const name = crypto.randomBytes(16).toString('hex');
      const error = new Error('Product not found');

      jest.spyOn(productReposiroty, 'findOneBy').mockResolvedValue(null);

      const result = await service.deleteProduct(name);

      expect(productReposiroty.findOneBy).toBeCalledTimes(1);
      expect(productReposiroty.findOneBy).toBeCalledWith({ name });

      expect(productReposiroty.delete).toBeCalledTimes(0);

      expect(result).toEqual({ status: 'Error', message: error.message });
    });

    it('should throw internal repository error', async () => {
      const { id, ...randomProduct } = generateRandomProduct();
      const error = new Error('internal repository error');

      jest.spyOn(productReposiroty, 'findOneBy').mockResolvedValue({ 
        ...randomProduct,
        id, 
      });

      jest.spyOn(productReposiroty, 'delete').mockRejectedValue(error);

      const result = await service.deleteProduct(randomProduct.name);

      expect(productReposiroty.findOneBy).toBeCalledTimes(1);
      expect(productReposiroty.findOneBy).toBeCalledWith({ name: randomProduct.name });

      expect(productReposiroty.delete).toBeCalledTimes(1);
      expect(productReposiroty.delete).toBeCalledWith({ id, ...randomProduct });
    
      expect(result).toBeUndefined();
    });
  });
});
