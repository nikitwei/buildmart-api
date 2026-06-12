import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn(),
}));
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RbacService } from '../rbac/rbac.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let rbacService: RbacService;

  const mockUsersService = {
    create: jest.fn(),
    findOne: jest.fn(),
    findByEmailWithPassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockRbacService = {
    assignRoleToUser: jest.fn(),
    getUserPermissions: jest.fn().mockResolvedValue(new Set()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: RbacService, useValue: mockRbacService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    rbacService = module.get<RbacService>(RbacService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should create user, assign customer role, and return token', async () => {
      const dto = { email: 'test@test.com', name: 'Test', password: '12345678' };
      const savedUser = { id: 'uuid', email: dto.email, name: dto.name, createdAt: new Date(), updatedAt: new Date() };

      mockUsersService.create.mockResolvedValue(savedUser);
      mockJwtService.sign.mockReturnValue('mocked-token');

      const result = await service.register(dto);

      expect(result.accessToken).toBe('mocked-token');
      expect(result.user).toEqual(savedUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
      expect(mockRbacService.assignRoleToUser).toHaveBeenCalledWith(savedUser.id, 'customer');
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: savedUser.id, email: savedUser.email });
    });

    it('should throw ConflictException for duplicate email', async () => {
      const dto = { email: 'dup@test.com', name: 'Dup', password: '12345678' };

      mockUsersService.create.mockRejectedValue(new ConflictException('Email already exists'));

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const dto = { email: 'test@test.com', password: 'correct-password' };
      const user = { id: 'uuid', email: dto.email, name: 'Test', password: 'hashed-password', createdAt: new Date(), updatedAt: new Date() };

      mockUsersService.findByEmailWithPassword.mockResolvedValue(user);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue('mocked-token');

      const result = await service.login(dto);

      expect(result.accessToken).toBe('mocked-token');
      expect(result.user).not.toHaveProperty('password');
      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, user.password);
    });

    it('should throw UnauthorizedException for wrong email', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(service.login({ email: 'unknown@test.com', password: 'password' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const user = { id: 'uuid', email: 'test@test.com', name: 'Test', password: 'hashed-password' };

      mockUsersService.findByEmailWithPassword.mockResolvedValue(user);
      jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(service.login({ email: 'test@test.com', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user when found', async () => {
      const user = { id: 'uuid', email: 'test@test.com', name: 'Test' };
      mockUsersService.findOne.mockResolvedValue(user);

      const result = await service.validateUser('uuid');

      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUsersService.findOne.mockRejectedValue(new Error('Not found'));

      await expect(service.validateUser('bad-id')).rejects.toThrow(UnauthorizedException);
    });
  });
});
