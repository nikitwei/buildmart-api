import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from './entities/merchant.entity';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { RbacService } from '../rbac/rbac.service';

@Injectable()
export class MerchantsService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantsRepository: Repository<Merchant>,
    private readonly rbacService: RbacService,
  ) {}

  async create(userId: string, createMerchantDto: CreateMerchantDto): Promise<Merchant> {
    const existing = await this.merchantsRepository.findOneBy({ userId });
    if (existing) {
      throw new ConflictException('User already has a merchant store');
    }

    const merchant = this.merchantsRepository.create({ ...createMerchantDto, userId });
    const saved = await this.merchantsRepository.save(merchant);

    await this.rbacService.assignRoleToUser(userId, 'store_owner');

    return saved;
  }

  findAll(): Promise<Merchant[]> {
    return this.merchantsRepository.find();
  }

  async findOne(id: string): Promise<Merchant> {
    const merchant = await this.merchantsRepository.findOneBy({ id });
    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }
    return merchant;
  }

  async findByOwner(userId: string): Promise<Merchant> {
    const merchant = await this.merchantsRepository.findOneBy({ userId });
    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }
    return merchant;
  }

  async update(id: string, updateMerchantDto: UpdateMerchantDto): Promise<Merchant> {
    const merchant = await this.findOne(id);
    Object.assign(merchant, updateMerchantDto);
    return this.merchantsRepository.save(merchant);
  }

  async updateStatus(id: string, status: string): Promise<Merchant> {
    const merchant = await this.findOne(id);
    merchant.status = status;
    return this.merchantsRepository.save(merchant);
  }

  async remove(id: string): Promise<void> {
    const merchant = await this.findOne(id);
    await this.merchantsRepository.remove(merchant);
  }
}
