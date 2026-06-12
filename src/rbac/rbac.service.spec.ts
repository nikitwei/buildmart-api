import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RbacService } from './rbac.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { User } from '../users/entities/user.entity';

describe('RbacService', () => {
  let service: RbacService;
  let rolesRepository: Repository<Role>;
  let permissionsRepository: Repository<Permission>;
  let usersRepository: Repository<User>;

  const mockRepo = {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacService,
        { provide: getRepositoryToken(Role), useValue: { ...mockRepo } },
        { provide: getRepositoryToken(Permission), useValue: { ...mockRepo } },
        { provide: getRepositoryToken(User), useValue: { ...mockRepo } },
      ],
    }).compile();

    service = module.get<RbacService>(RbacService);
    rolesRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    permissionsRepository = module.get<Repository<Permission>>(getRepositoryToken(Permission));
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => jest.clearAllMocks());

  describe('getUserPermissions', () => {
    it('should return a flat set of permission names', async () => {
      const mockUser = {
        id: 'uuid',
        roles: [
          {
            name: 'store_owner',
            permissions: [{ name: 'product:write' }, { name: 'stock:write' }],
          },
          {
            name: 'inventory_manager',
            permissions: [{ name: 'product:write' }, { name: 'stock:write' }],
          },
        ],
      };
      mockRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserPermissions('uuid');

      expect(result.has('product:write')).toBe(true);
      expect(result.has('stock:write')).toBe(true);
      expect(result.size).toBe(2);
    });

    it('should return empty set when user not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.getUserPermissions('bad-id');

      expect(result.size).toBe(0);
    });
  });

  describe('findRoleByName', () => {
    it('should find role by name', async () => {
      mockRepo.findOneBy.mockResolvedValue({ id: 'uuid', name: 'admin' });

      const result = await service.findRoleByName('admin');

      expect(result).toBeDefined();
      expect(result?.name).toBe('admin');
    });
  });

  describe('assignRoleToUser', () => {
    it('should add role to user if not already assigned', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'uid', roles: [] });
      mockRepo.findOneBy.mockResolvedValue({ id: 'rid', name: 'customer' });
      mockRepo.save.mockResolvedValue({});

      await service.assignRoleToUser('uid', 'customer');

      expect(mockRepo.save).toHaveBeenCalled();
    });
  });
});
