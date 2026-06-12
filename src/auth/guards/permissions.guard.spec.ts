import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  const mockContext = (permissions?: Set<string>, requiredPermissions?: string[]) => ({
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({
        user: permissions ? { permissions } : undefined,
      }),
    }),
  }) as any;

  it('should allow when no @Permissions() is set', () => {
    const context = mockContext(new Set(['any']));
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow when user has the exact permission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['product:write']);
    const context = mockContext(new Set(['product:write']));

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow when user has "all" bypass', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['product:write']);
    const context = mockContext(new Set(['all']));

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow when user has one of multiple required permissions', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['a', 'b']);
    const context = mockContext(new Set(['b']));

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny when user does not have required permission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const context = mockContext(new Set(['user:read']));

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should deny when no user on request', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    const context = mockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
