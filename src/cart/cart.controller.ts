import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user cart with product details' })
  @ApiResponse({ status: 200, description: 'Cart with enriched items', schema: { example: { id: 'cart-uuid', items: [{ id: 'item-uuid', productId: 'prod-uuid', quantity: 20, product: { name: 'Portland Cement 50kg', price: 45000, sku: 'CEM-PORT-050' } }], totalPrice: 900000, itemCount: 20 } } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getCart(@CurrentUser() user: { id: string }) {
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added', schema: { example: { id: 'item-uuid', cartId: 'cart-uuid', productId: 'prod-uuid', quantity: 20 } } })
  @ApiResponse({ status: 400, description: 'Validation error', schema: { example: { message: ['quantity must not be less than 1'], error: 'Bad Request', statusCode: 400 } } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  addItem(@CurrentUser() user: { id: string }, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user.id, dto);
  }

  @Patch('items/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'id', description: 'Cart item UUID' })
  @ApiResponse({ status: 200, description: 'Quantity updated', schema: { example: { id: 'item-uuid', quantity: 15, productId: 'prod-uuid', cartId: 'cart-uuid' } } })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  updateItem(@CurrentUser() user: { id: string }, @Param('id') id: string, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateItemQuantity(user.id, id, dto);
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'id', description: 'Cart item UUID' })
  @ApiResponse({ status: 204, description: 'Item removed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  removeItem(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.cartService.removeItem(user.id, id);
  }
}
