import { IsString, IsNumber, IsInt, IsOptional, Min, Max, MinLength, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const CATEGORIES = [
  'cement', 'bricks', 'lumber', 'roofing',
  'paint', 'tools', 'plumbing', 'electrical',
] as const;

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Portland Cement 50kg', minLength: 3 })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiPropertyOptional({ description: 'Product description', example: 'High-quality Type I Portland cement for general construction.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Product price in IDR', example: 45000, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Product category', example: 'cement', enum: CATEGORIES })
  @IsString()
  @IsIn(CATEGORIES)
  category: string;

  @ApiPropertyOptional({ description: 'Available stock quantity', example: 150, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ description: 'Average rating (0-5)', example: 4.5, minimum: 0, maximum: 5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'Product image URL', example: '/images/cement.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'Stock Keeping Unit (unique)', example: 'CEM-PORT-050', minLength: 4 })
  @IsString()
  @MinLength(4)
  sku: string;
}
