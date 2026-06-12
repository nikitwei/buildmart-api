import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductsService } from '../products/products.service';

describe('CartService', () => {
  let service: CartService;
  let cartRepository: Repository<Cart>;
  let cartItemRepository: Repository<CartItem>;
  let productsService: ProductsService;

  const mockCartRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCartItemRepo = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockProductsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Cart), useValue: mockCartRepo },
        { provide: getRepositoryToken(CartItem), useValue: mockCartItemRepo },
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepository = module.get<Repository<Cart>>(getRepositoryToken(Cart));
    cartItemRepository = module.get<Repository<CartItem>>(getRepositoryToken(CartItem));
    productsService = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getCart', () => {
    it('should return enriched cart with totalPrice', async () => {
      const cart = {
        id: 'cart-uuid',
        userId: 'user-uuid',
        items: [
          { id: 'item-1', productId: 'prod-1', quantity: 10, cartId: 'cart-uuid' },
          { id: 'item-2', productId: 'prod-2', quantity: 5, cartId: 'cart-uuid' },
        ],
      };
      mockCartRepo.findOne.mockResolvedValue(cart);
      mockProductsService.findOne
        .mockResolvedValueOnce({ id: 'prod-1', name: 'Cement', price: 50000 })
        .mockResolvedValueOnce({ id: 'prod-2', name: 'Bricks', price: 2000 });

      const result = await service.getCart('user-uuid');

      expect(result.totalPrice).toBe(510000);
      expect(result.itemCount).toBe(15);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].product.name).toBe('Cement');
    });

    it('should return empty cart when no cart exists', async () => {
      mockCartRepo.findOne.mockResolvedValue(null);

      const result = await service.getCart('user-uuid');

      expect(result.totalPrice).toBe(0);
      expect(result.itemCount).toBe(0);
      expect(result.items).toEqual([]);
    });

    it('should return empty cart when cart has no items', async () => {
      mockCartRepo.findOne.mockResolvedValue({ id: 'cart-uuid', items: [] });

      const result = await service.getCart('user-uuid');

      expect(result.totalPrice).toBe(0);
      expect(result.itemCount).toBe(0);
    });
  });

  describe('addItem', () => {
    it('should create new cart item when product not already in cart', async () => {
      const dto = { productId: 'prod-1', quantity: 5 };
      mockProductsService.findOne.mockResolvedValue({ id: 'prod-1' });
      mockCartRepo.findOne.mockResolvedValue({ id: 'cart-uuid', userId: 'user-uuid', items: [] });
      mockCartItemRepo.create.mockReturnValue(dto);
      mockCartItemRepo.save.mockResolvedValue({ id: 'item-uuid', ...dto, cartId: 'cart-uuid' });

      const result = await service.addItem('user-uuid', dto);

      expect(result.quantity).toBe(5);
      expect(mockCartItemRepo.create).toHaveBeenCalled();
    });

    it('should increment quantity when product already in cart', async () => {
      const dto = { productId: 'prod-1', quantity: 3 };
      const existingItem = { id: 'item-uuid', productId: 'prod-1', quantity: 10, cartId: 'cart-uuid' };
      mockProductsService.findOne.mockResolvedValue({ id: 'prod-1' });
      mockCartRepo.findOne.mockResolvedValue({ id: 'cart-uuid', items: [existingItem] });
      mockCartItemRepo.save.mockResolvedValue({ ...existingItem, quantity: 13 });

      const result = await service.addItem('user-uuid', dto);

      expect(result.quantity).toBe(13);
      expect(mockCartItemRepo.create).not.toHaveBeenCalled();
    });

    it('should create cart and item when no cart exists', async () => {
      const dto = { productId: 'prod-1', quantity: 5 };
      mockProductsService.findOne.mockResolvedValue({ id: 'prod-1' });
      mockCartRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'new-cart', items: [] });
      mockCartRepo.create.mockReturnValue({ id: 'new-cart', userId: 'user-uuid', items: [] });
      mockCartRepo.save.mockResolvedValue({ id: 'new-cart', userId: 'user-uuid', items: [] });
      mockCartItemRepo.create.mockReturnValue(dto);
      mockCartItemRepo.save.mockResolvedValue({ id: 'item-uuid', quantity: 5, productId: 'prod-1', cartId: 'new-cart' });

      const result = await service.addItem('user-uuid', dto);

      expect(result.quantity).toBe(5);
      expect(mockCartRepo.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when product does not exist', async () => {
      const dto = { productId: 'bad-prod', quantity: 1 };
      mockProductsService.findOne.mockRejectedValue(new NotFoundException('Product not found'));

      await expect(service.addItem('user-uuid', dto)).rejects.toThrow(NotFoundException);
      expect(mockCartItemRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('updateItemQuantity', () => {
    it('should update quantity', async () => {
      const item = { id: 'item-uuid', quantity: 5, productId: 'prod-1', cartId: 'cart-uuid' };
      mockCartItemRepo.findOneBy.mockResolvedValue(item);
      mockCartItemRepo.save.mockResolvedValue({ ...item, quantity: 15 });

      const result = await service.updateItemQuantity('item-uuid', { quantity: 15 });

      expect(result.quantity).toBe(15);
    });

    it('should throw NotFoundException when item does not exist', async () => {
      mockCartItemRepo.findOneBy.mockResolvedValue(null);

      await expect(service.updateItemQuantity('bad-id', { quantity: 5 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeItem', () => {
    it('should remove item', async () => {
      const item = { id: 'item-uuid', productId: 'prod-1', quantity: 1 };
      mockCartItemRepo.findOneBy.mockResolvedValue(item);
      mockCartItemRepo.remove.mockResolvedValue(undefined);

      await service.removeItem('item-uuid');

      expect(mockCartItemRepo.remove).toHaveBeenCalledWith(item);
    });

    it('should throw NotFoundException when item does not exist', async () => {
      mockCartItemRepo.findOneBy.mockResolvedValue(null);

      await expect(service.removeItem('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
