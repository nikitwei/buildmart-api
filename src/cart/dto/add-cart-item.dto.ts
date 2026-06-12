import { IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCartItemDto {
  @ApiProperty({ description: 'Product UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Quantity to add', example: 20, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
