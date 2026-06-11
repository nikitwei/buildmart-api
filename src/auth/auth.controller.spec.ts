import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should call authService.register on POST /auth/register', async () => {
    const dto = { email: 'test@test.com', name: 'Test', password: '12345678' };
    mockAuthService.register.mockResolvedValue({ accessToken: 'token', user: { id: 'uuid' } });

    await controller.register(dto);

    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('should call authService.login on POST /auth/login', async () => {
    const dto = { email: 'test@test.com', password: '12345678' };
    mockAuthService.login.mockResolvedValue({ accessToken: 'token', user: { id: 'uuid' } });

    await controller.login(dto);

    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('should call authService.validateUser on GET /auth/me', async () => {
    const user = { id: 'uuid', email: 'test@test.com' };
    mockAuthService.validateUser.mockResolvedValue(user);

    const result = await controller.me(user);

    expect(authService.validateUser).toHaveBeenCalledWith(user.id);
    expect(result).toEqual(user);
  });
});
