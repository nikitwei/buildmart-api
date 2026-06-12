import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockService }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should call service.create on POST /products', async () => {
    const dto = { name: 'Product', price: 100, category: 'cement' as const, sku: 'SKU-1' };

    await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
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
