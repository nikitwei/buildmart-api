import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMerchantDto {
  @ApiProperty({ description: 'Store name', example: 'ABC Building Supplies', minLength: 3, maxLength: 200 })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  storeName: string;

  @ApiPropertyOptional({ description: 'Store description', example: 'Your trusted source for quality building materials since 2010.' })
  @IsOptional()
  @IsString()
  storeDescription?: string;

  @ApiPropertyOptional({ description: 'Contact phone', example: '021-555-1234' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Store address', example: 'Jl. Sudirman No. 10' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'City', example: 'Jakarta' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Province', example: 'DKI Jakarta' })
  @IsOptional()
  @IsString()
  province?: string;
}
