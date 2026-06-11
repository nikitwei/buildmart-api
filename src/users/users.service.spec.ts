import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
}));
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

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
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const dto = { email: 'test@test.com', name: 'Test', password: '12345678' };

      mockRepository.findOneBy.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(dto);
      mockRepository.save.mockResolvedValue({ id: 'uuid', ...dto, password: 'hashed' });

      const result = await service.create(dto);

      expect(result.email).toBe(dto.email);
      expect(result.password).not.toBe(dto.password);
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException for duplicate email', async () => {
      const dto = { email: 'dup@test.com', name: 'Dup', password: '12345678' };

      mockRepository.findOneBy.mockResolvedValue({ id: '1', email: dto.email, name: dto.name, password: dto.password });
      mockRepository.save.mockClear();

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        { id: '1', email: 'a@a.com', name: 'A' },
        { id: '2', email: 'b@b.com', name: 'B' },
      ];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = { id: '1', email: 'a@a.com', name: 'A' };
      mockRepository.findOneBy.mockResolvedValue(user);

      const result = await service.findOne('1');

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update user fields', async () => {
      const existingUser = { id: '1', email: 'a@a.com', name: 'A' };
      mockRepository.findOneBy.mockResolvedValue(existingUser);
      mockRepository.save.mockResolvedValue({ ...existingUser, name: 'Updated' });

      const result = await service.update('1', { name: 'Updated' });

      expect(result.name).toBe('Updated');
      expect(result.email).toBe('a@a.com');
    });

    it('should hash password when updating password', async () => {
      const existingUser = { id: '1', email: 'a@a.com', name: 'A' };
      mockRepository.findOneBy.mockResolvedValue(existingUser);
      mockRepository.save.mockResolvedValue({ ...existingUser, password: 'hashed' });

      await service.update('1', { password: 'newpassword' });

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const user = { id: '1', email: 'a@a.com', name: 'A' };
      mockRepository.findOneBy.mockResolvedValue(user);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove('1');

      expect(mockRepository.remove).toHaveBeenCalledWith(user);
    });
  });
});
