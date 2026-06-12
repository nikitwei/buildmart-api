import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('CartController', () => {
  let controller: CartController;
  let cartService: CartService;

  const mockService = {
    getCart: jest.fn(),
    addItem: jest.fn(),
    updateItemQuantity: jest.fn(),
    removeItem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [{ provide: CartService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CartController>(CartController);
    cartService = module.get<CartService>(CartService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should call cartService.getCart on GET /cart', async () => {
    const user = { id: 'user-uuid' };
    await controller.getCart(user);

    expect(cartService.getCart).toHaveBeenCalledWith('user-uuid');
  });

  it('should call cartService.addItem on POST /cart/items', async () => {
    const user = { id: 'user-uuid' };
    const dto = { productId: 'prod-uuid', quantity: 5 };

    await controller.addItem(user, dto);

    expect(cartService.addItem).toHaveBeenCalledWith('user-uuid', dto);
  });

  it('should call cartService.updateItemQuantity on PATCH /cart/items/:id', async () => {
    const user = { id: 'user-uuid' };
    const dto = { quantity: 10 };

    await controller.updateItem(user, 'item-uuid', dto);

    expect(cartService.updateItemQuantity).toHaveBeenCalledWith('user-uuid', 'item-uuid', dto);
  });

  it('should call cartService.removeItem on DELETE /cart/items/:id', async () => {
    const user = { id: 'user-uuid' };

    await controller.removeItem(user, 'item-uuid');

    expect(cartService.removeItem).toHaveBeenCalledWith('user-uuid', 'item-uuid');
  });
});
