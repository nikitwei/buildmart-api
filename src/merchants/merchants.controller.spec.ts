import { Test, TestingModule } from '@nestjs/testing';
import { MerchantsController } from './merchants.controller';
import { MerchantsService } from './merchants.service';

describe('MerchantsController', () => {
  let controller: MerchantsController;
  let service: MerchantsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByOwner: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MerchantsController],
      providers: [{ provide: MerchantsService, useValue: mockService }],
    }).compile();

    controller = module.get<MerchantsController>(MerchantsController);
    service = module.get<MerchantsService>(MerchantsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should call service.create on POST /merchants', async () => {
    const dto = { storeName: 'ABC Store', city: 'Jakarta' };
    const user = { id: 'user-uuid' };

    await controller.create(user, dto);

    expect(service.create).toHaveBeenCalledWith(user.id, dto);
  });

  it('should call service.findAll on GET /merchants', async () => {
    await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
  });

  it('should call service.findByOwner on GET /merchants/me', async () => {
    const user = { id: 'user-uuid' };

    await controller.findMe(user);

    expect(service.findByOwner).toHaveBeenCalledWith(user.id);
  });

  it('should call service.findOne on GET /merchants/:id', async () => {
    await controller.findOne('merchant-uuid');

    expect(service.findOne).toHaveBeenCalledWith('merchant-uuid');
  });

  it('should call service.update on PATCH /merchants/:id', async () => {
    await controller.update('merchant-uuid', { storeName: 'Updated' });

    expect(service.update).toHaveBeenCalledWith('merchant-uuid', { storeName: 'Updated' });
  });

  it('should call service.updateStatus on PATCH /merchants/:id/status', async () => {
    await controller.updateStatus('merchant-uuid', 'suspended');

    expect(service.updateStatus).toHaveBeenCalledWith('merchant-uuid', 'suspended');
  });

  it('should call service.remove on DELETE /merchants/:id', async () => {
    await controller.remove('merchant-uuid');

    expect(service.remove).toHaveBeenCalledWith('merchant-uuid');
  });
});
