import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { MerchantsService } from '../merchants/merchants.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockMerchantsService = {
    findByOwner: jest.fn().mockResolvedValue({ id: 'merchant-uuid' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: mockService },
        { provide: MerchantsService, useValue: mockMerchantsService },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should call service.create on POST /products', async () => {
    const dto = { name: 'Product', price: 100, category: 'cement' as const, sku: 'SKU-1' };
    const user = { id: 'user-uuid', permissions: new Set<string>() };

    await controller.create(dto, user);

    expect(mockMerchantsService.findByOwner).toHaveBeenCalledWith('user-uuid');
    expect(service.create).toHaveBeenCalledWith(dto, 'merchant-uuid');
  });

  it('should skip merchant lookup for super admin on POST /products', async () => {
    const dto = { name: 'Product', price: 100, category: 'cement' as const, sku: 'SKU-1' };
    const admin = { id: 'admin-uuid', permissions: new Set(['all']) };

    await controller.create(dto, admin);

    expect(mockMerchantsService.findByOwner).not.toHaveBeenCalled();
    expect(service.create).toHaveBeenCalledWith(dto, undefined);
  });

  it('should call service.findAll on GET /products', async () => {
    await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
  });

  it('should call service.findOne on GET /products/:id', async () => {
    await controller.findOne('uuid');

    expect(service.findOne).toHaveBeenCalledWith('uuid');
  });

  it('should call service.update on PATCH /products/:id', async () => {
    await controller.update('uuid', { name: 'Updated' });

    expect(service.update).toHaveBeenCalledWith('uuid', { name: 'Updated' });
  });

  it('should call service.remove on DELETE /products/:id', async () => {
    await controller.remove('uuid');

    expect(service.remove).toHaveBeenCalledWith('uuid');
  });
});
