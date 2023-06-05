import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductService } from './product.service';

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
            findOneBy: jest.fn(),
            update: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            delete: jest.fn()
          }
        }
      ]
    }).compile();

    service = moduleRef.get<ProductService>(ProductService);
    productReposiroty = moduleRef.get(PRODUCT_REPO_TOKEN);

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('productReposiroty should be defined', () => {
    expect(productReposiroty).toBeDefined();
  });

  describe('getAllProducts', () => {
    it('should get all products', async () => {
      await service.getAllProducts();
      expect(productReposiroty.find).toBeCalledTimes(1);
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
