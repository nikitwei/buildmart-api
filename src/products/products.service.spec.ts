import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create a product with valid data', async () => {
      const dto = {
        name: 'Portland Cement 50kg',
        price: 45000,
        category: 'cement' as const,
        sku: 'CEM-PORT-050',
        stock: 150,
      };

      mockRepository.findOneBy.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(dto);
      mockRepository.save.mockResolvedValue({ id: 'uuid', ...dto, createdAt: new Date(), updatedAt: new Date() });

      const result = await service.create(dto);

      expect(result.sku).toBe(dto.sku);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException for duplicate SKU', async () => {
      const dto = { name: 'Test', price: 100, category: 'tools' as const, sku: 'DUP-SKU' };

      mockRepository.findOneBy.mockResolvedValue({ id: '1', sku: dto.sku });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const products = [
        { id: '1', name: 'A', price: 100, category: 'cement', sku: 'SKU-1' },
        { id: '2', name: 'B', price: 200, category: 'lumber', sku: 'SKU-2' },
        { id: '3', name: 'C', price: 300, category: 'tools', sku: 'SKU-3' },
      ];
      mockRepository.find.mockResolvedValue(products);

      const result = await service.findAll();

      expect(result).toEqual(products);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const product = { id: '1', name: 'Product', price: 100, category: 'cement', sku: 'SKU-1' };
      mockRepository.findOneBy.mockResolvedValue(product);

      const result = await service.findOne('1');

      expect(result).toEqual(product);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update product fields', async () => {
      const existingProduct = { id: '1', name: 'Old Name', price: 100, category: 'cement', sku: 'SKU-1' };
      mockRepository.findOneBy.mockResolvedValue(existingProduct);
      mockRepository.save.mockResolvedValue({ ...existingProduct, name: 'New Name' });

      const result = await service.update('1', { name: 'New Name' });

      expect(result.name).toBe('New Name');
      expect(result.sku).toBe('SKU-1');
    });

    it('should throw ConflictException when updating to an existing SKU', async () => {
      mockRepository.findOneBy
        .mockResolvedValueOnce({ id: '1', name: 'Product', price: 100, category: 'cement', sku: 'OLD-SKU' })
        .mockResolvedValueOnce({ id: '2', name: 'Other', price: 200, category: 'tools', sku: 'TAKEN-SKU' });

      await expect(service.update('1', { sku: 'TAKEN-SKU' })).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when updating non-existent product', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update('bad-id', { name: 'New' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      const product = { id: '1', name: 'Product', price: 100, category: 'cement', sku: 'SKU-1' };
      mockRepository.findOneBy.mockResolvedValue(product);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove('1');

      expect(mockRepository.remove).toHaveBeenCalledWith(product);
    });
  });
});
