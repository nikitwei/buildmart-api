import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, merchantId?: string): Promise<Product> {
    const existing = await this.productsRepository.findOneBy({ sku: createProductDto.sku });
    if (existing) {
      throw new ConflictException('SKU already exists');
    }

    const product = this.productsRepository.create({
      ...createProductDto,
      merchantId: merchantId ?? null,
    });
    return this.productsRepository.save(product);
  }

  findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existing = await this.productsRepository.findOneBy({ sku: updateProductDto.sku });
      if (existing) {
        throw new ConflictException('SKU already exists');
      }
    }

    Object.assign(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }
}
