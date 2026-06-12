import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { User } from '../users/entities/user.entity';

const SEED_PERMISSIONS = [
  { name: 'all', description: 'Bypass all permission checks' },
  { name: 'user:read', description: 'View user profiles' },
  { name: 'user:write', description: 'Create/update users' },
  { name: 'user:role', description: 'Change user roles' },
  { name: 'merchant:read', description: 'View merchant stores' },
  { name: 'merchant:write', description: 'Create/update any merchant' },
  { name: 'merchant:own', description: 'Manage own merchant store' },
  { name: 'product:write', description: 'Create/update/delete products' },
  { name: 'order:read', description: 'View orders' },
  { name: 'order:write', description: 'Modify orders' },
  { name: 'stock:write', description: 'Adjust inventory levels' },
];

const SEED_ROLES: { name: string; description: string; permissions: string[] }[] = [
  { name: 'super_admin', description: 'BuildMart super admin', permissions: ['all'] },
  { name: 'customer_service', description: 'BuildMart customer service', permissions: ['user:read', 'merchant:read'] },
  { name: 'store_owner', description: 'Merchant store owner', permissions: ['merchant:own', 'product:write', 'order:read', 'stock:write'] },
  { name: 'finance_staff', description: 'Merchant finance staff', permissions: ['order:read', 'order:write'] },
  { name: 'inventory_manager', description: 'Merchant inventory manager', permissions: ['product:write', 'stock:write'] },
  { name: 'customer', description: 'Regular customer', permissions: [] },
];

@Injectable()
export class RbacService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedRolesAndPermissions();
  }

  async seedRolesAndPermissions() {
    const permMap = new Map<string, Permission>();

    for (const p of SEED_PERMISSIONS) {
      let perm = await this.permissionsRepository.findOneBy({ name: p.name });
      if (!perm) {
        perm = this.permissionsRepository.create(p);
        perm = await this.permissionsRepository.save(perm);
      }
      permMap.set(p.name, perm);
    }

    for (const r of SEED_ROLES) {
      let role = await this.rolesRepository.findOneBy({ name: r.name });
      if (role) continue;
      role = this.rolesRepository.create({ name: r.name, description: r.description });
      role = await this.rolesRepository.save(role);
      const perms = r.permissions.map((name) => permMap.get(name)).filter(Boolean) as Permission[];
      if (perms.length) {
        role.permissions = perms;
        await this.rolesRepository.save(role);
      }
    }
  }

  async getUserPermissions(userId: string): Promise<Set<string>> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { roles: { permissions: true } },
    });
    if (!user) return new Set();
    const perms = new Set<string>();
    for (const role of user.roles || []) {
      for (const perm of role.permissions || []) {
        perms.add(perm.name);
      }
    }
    return perms;
  }

  async findRoleByName(name: string): Promise<Role | null> {
    return this.rolesRepository.findOneBy({ name });
  }

  async assignRoleToUser(userId: string, roleName: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { roles: true },
    });
    if (!user) return;
    const role = await this.rolesRepository.findOneBy({ name: roleName });
    if (!role) return;
    if (!user.roles?.some((r) => r.name === roleName)) {
      user.roles = [...(user.roles || []), role];
      await this.usersRepository.save(user);
    }
  }
}
