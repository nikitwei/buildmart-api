import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({ description: 'New quantity (min 1)', example: 15, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
