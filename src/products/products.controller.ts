import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Portland Cement 50kg',
        description: 'High-quality Type I Portland cement for general construction.',
        price: 45000,
        category: 'cement',
        stock: 150,
        rating: null,
        imageUrl: '/images/cement.jpg',
        sku: 'CEM-PORT-050',
        createdAt: '2026-06-12T10:00:00.000Z',
        updatedAt: '2026-06-12T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input (e.g. invalid category, negative price)',
    schema: {
      example: {
        message: [
          'price must not be less than 0',
          'category must be one of: cement, bricks, lumber, roofing, paint, tools, plumbing, electrical',
        ],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'SKU already exists',
    schema: {
      example: {
        message: 'SKU already exists',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all products' })
  @ApiResponse({
    status: 200,
    description: 'Array of products',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Portland Cement 50kg',
          price: 45000,
          category: 'cement',
          stock: 150,
          sku: 'CEM-PORT-050',
          createdAt: '2026-06-12T10:00:00.000Z',
          updatedAt: '2026-06-12T10:00:00.000Z',
        },
      ],
    },
  })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Portland Cement 50kg',
        description: 'High-quality Type I Portland cement for general construction.',
        price: 45000,
        category: 'cement',
        stock: 150,
        rating: null,
        imageUrl: '/images/cement.jpg',
        sku: 'CEM-PORT-050',
        createdAt: '2026-06-12T10:00:00.000Z',
        updatedAt: '2026-06-12T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
    schema: {
      example: {
        message: 'Product not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product (partial update)' })
  @ApiParam({ name: 'id', description: 'Product UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Portland Cement 50kg (Updated Price)',
        price: 47000,
        category: 'cement',
        stock: 150,
        sku: 'CEM-PORT-050',
        createdAt: '2026-06-12T10:00:00.000Z',
        updatedAt: '2026-06-12T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
    schema: {
      example: {
        message: 'Product not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'SKU conflict',
    schema: {
      example: {
        message: 'SKU already exists',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', description: 'Product UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully (no content)' })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
    schema: {
      example: {
        message: 'Product not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
