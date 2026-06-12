import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productsService: ProductsService,
  ) {}

  private async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: { items: true },
    });
    if (!cart) {
      cart = this.cartRepository.create({ userId, items: [] });
      cart = await this.cartRepository.save(cart);
    }
    return cart;
  }

  async getCart(userId: string) {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: { items: true },
    });

    if (!cart) {
      return { items: [], totalPrice: 0, itemCount: 0 };
    }

    const enrichedItems = await Promise.all(
      cart.items.map(async (item) => {
        try {
          const product = await this.productsService.findOne(item.productId);
          return { ...item, product };
        } catch {
          return { ...item, product: null };
        }
      }),
    );

    const totalPrice = enrichedItems.reduce((sum, item) => {
      const price = Number((item as any).product?.price ?? 0);
      return sum + price * item.quantity;
    }, 0);

    const itemCount = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);

    return { id: cart.id, items: enrichedItems, totalPrice, itemCount };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    await this.productsService.findOne(dto.productId);

    const cart = await this.getOrCreateCart(userId);

    const existing = cart.items.find((i) => i.productId === dto.productId);
    if (existing) {
      existing.quantity += dto.quantity;
      return this.cartItemRepository.save(existing);
    }

    const item = this.cartItemRepository.create({
      cartId: cart.id,
      productId: dto.productId,
      quantity: dto.quantity,
    });
    return this.cartItemRepository.save(item);
  }

  async updateItemQuantity(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: { cart: true },
    });
    if (!item || item.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }
    item.quantity = dto.quantity;
    return this.cartItemRepository.save(item);
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: { cart: true },
    });
    if (!item || item.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }
    await this.cartItemRepository.remove(item);
  }
}
