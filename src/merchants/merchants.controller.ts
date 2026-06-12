import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { MerchantsService } from './merchants.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('merchants')
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register as a merchant' })
  @ApiResponse({ status: 201, description: 'Merchant store created', schema: { example: { id: 'uuid', userId: 'uuid', storeName: 'ABC Building Supplies', phone: '021-555-1234', city: 'Jakarta', status: 'active', createdAt: '2026-06-12T10:00:00.000Z', updatedAt: '2026-06-12T10:00:00.000Z' } } })
  @ApiResponse({ status: 400, description: 'Validation error', schema: { example: { message: ['storeName must be longer than or equal to 3 characters'], error: 'Bad Request', statusCode: 400 } } })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: { example: { message: 'Unauthorized', statusCode: 401 } } })
  @ApiResponse({ status: 409, description: 'User already has a merchant', schema: { example: { message: 'User already has a merchant store', error: 'Conflict', statusCode: 409 } } })
  create(@CurrentUser() user: { id: string }, @Body() createMerchantDto: CreateMerchantDto) {
    return this.merchantsService.create(user.id, createMerchantDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all merchants' })
  @ApiResponse({ status: 200, description: 'Array of merchants', schema: { example: [{ id: 'uuid', storeName: 'ABC Building Supplies', city: 'Jakarta', status: 'active', createdAt: '2026-06-12T10:00:00.000Z' }] } })
  findAll() {
    return this.merchantsService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my own merchant store' })
  @ApiResponse({ status: 200, description: 'My merchant store', schema: { example: { id: 'uuid', storeName: 'ABC Building Supplies', city: 'Jakarta', status: 'active', createdAt: '2026-06-12T10:00:00.000Z' } } })
  @ApiResponse({ status: 401, description: 'Unauthorized', schema: { example: { message: 'Unauthorized', statusCode: 401 } } })
  @ApiResponse({ status: 404, description: 'No merchant store', schema: { example: { message: 'Merchant not found', error: 'Not Found', statusCode: 404 } } })
  findMe(@CurrentUser() user: { id: string }) {
    return this.merchantsService.findByOwner(user.id);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a merchant by ID' })
  @ApiParam({ name: 'id', description: 'Merchant UUID' })
  @ApiResponse({ status: 200, description: 'Merchant found' })
  @ApiResponse({ status: 404, description: 'Not found', schema: { example: { message: 'Merchant not found', error: 'Not Found', statusCode: 404 } } })
  findOne(@Param('id') id: string) {
    return this.merchantsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('merchant:own')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update your merchant store' })
  @ApiParam({ name: 'id', description: 'Merchant UUID' })
  @ApiResponse({ status: 200, description: 'Merchant updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden', schema: { example: { message: 'Forbidden resource', error: 'Forbidden', statusCode: 403 } } })
  @ApiResponse({ status: 404, description: 'Not found' })
  update(@Param('id') id: string, @Body() updateMerchantDto: UpdateMerchantDto) {
    return this.merchantsService.update(id, updateMerchantDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('merchant:write')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update merchant status (admin)' })
  @ApiParam({ name: 'id', description: 'Merchant UUID' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.merchantsService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a merchant (admin)' })
  @ApiParam({ name: 'id', description: 'Merchant UUID' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  remove(@Param('id') id: string) {
    return this.merchantsService.remove(id);
  }
}
