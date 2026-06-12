import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { Merchant } from './entities/merchant.entity';
import { RbacService } from '../rbac/rbac.service';

describe('MerchantsService', () => {
  let service: MerchantsService;
  let repository: Repository<Merchant>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };

  const mockRbacService = {
    assignRoleToUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MerchantsService,
        { provide: getRepositoryToken(Merchant), useValue: mockRepository },
        { provide: RbacService, useValue: mockRbacService },
      ],
    }).compile();

    service = module.get<MerchantsService>(MerchantsService);
    repository = module.get<Repository<Merchant>>(getRepositoryToken(Merchant));
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create a merchant and assign store_owner role', async () => {
      const dto = { storeName: 'ABC Building Supplies', city: 'Jakarta' };
      mockRepository.findOneBy.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(dto);
      mockRepository.save.mockResolvedValue({ id: 'uuid', userId: 'user-uuid', ...dto, status: 'active' });

      const result = await service.create('user-uuid', dto);

      expect(result.storeName).toBe(dto.storeName);
      expect(mockRbacService.assignRoleToUser).toHaveBeenCalledWith('user-uuid', 'store_owner');
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if user already has a merchant', async () => {
      mockRepository.findOneBy.mockResolvedValue({ id: '1', userId: 'user-uuid' });

      await expect(service.create('user-uuid', { storeName: 'Test' })).rejects.toThrow(ConflictException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of merchants', async () => {
      const merchants = [
        { id: '1', storeName: 'Store A', userId: 'u1', status: 'active' },
        { id: '2', storeName: 'Store B', userId: 'u2', status: 'active' },
      ];
      mockRepository.find.mockResolvedValue(merchants);

      const result = await service.findAll();

      expect(result).toEqual(merchants);
    });
  });

  describe('findOne', () => {
    it('should return a merchant by id', async () => {
      const merchant = { id: '1', storeName: 'Store', userId: 'u1', status: 'active' };
      mockRepository.findOneBy.mockResolvedValue(merchant);

      const result = await service.findOne('1');

      expect(result).toEqual(merchant);
    });

    it('should throw NotFoundException when merchant does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByOwner', () => {
    it('should return a merchant by user id', async () => {
      const merchant = { id: '1', storeName: 'Store', userId: 'u1', status: 'active' };
      mockRepository.findOneBy.mockResolvedValue(merchant);

      const result = await service.findByOwner('u1');

      expect(result).toEqual(merchant);
    });

    it('should throw NotFoundException when no merchant found for user', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findByOwner('u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update merchant fields', async () => {
      const merchant = { id: '1', storeName: 'Old Name', userId: 'u1', status: 'active' };
      mockRepository.findOneBy.mockResolvedValue(merchant);
      mockRepository.save.mockResolvedValue({ ...merchant, storeName: 'New Name' });

      const result = await service.update('1', { storeName: 'New Name' });

      expect(result.storeName).toBe('New Name');
    });
  });

  describe('updateStatus', () => {
    it('should update merchant status', async () => {
      const merchant = { id: '1', storeName: 'Store', userId: 'u1', status: 'active' };
      mockRepository.findOneBy.mockResolvedValue(merchant);
      mockRepository.save.mockResolvedValue({ ...merchant, status: 'suspended' });

      const result = await service.updateStatus('1', 'suspended');

      expect(result.status).toBe('suspended');
    });
  });

  describe('remove', () => {
    it('should remove a merchant', async () => {
      const merchant = { id: '1', storeName: 'Store', userId: 'u1', status: 'active' };
      mockRepository.findOneBy.mockResolvedValue(merchant);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove('1');

      expect(mockRepository.remove).toHaveBeenCalledWith(merchant);
    });
  });
});
