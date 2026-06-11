import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should call service.create on POST /users', async () => {
    const dto = { email: 'a@a.com', name: 'A', password: '12345678' };

    await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should call service.findAll on GET /users', async () => {
    await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
  });

  it('should call service.findOne on GET /users/:id', async () => {
    await controller.findOne('uuid');

    expect(service.findOne).toHaveBeenCalledWith('uuid');
  });

  it('should call service.update on PATCH /users/:id', async () => {
    await controller.update('uuid', { name: 'New' });

    expect(service.update).toHaveBeenCalledWith('uuid', { name: 'New' });
  });

  it('should call service.remove on DELETE /users/:id', async () => {
    await controller.remove('uuid');

    expect(service.remove).toHaveBeenCalledWith('uuid');
  });
});
