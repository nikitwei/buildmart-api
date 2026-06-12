import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { RbacModule } from './rbac/rbac.module';
import { MerchantsModule } from './merchants/merchants.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    RbacModule,
    UsersModule,
    AuthModule,
    MerchantsModule,
    ProductsModule,
  ],
})
export class AppModule {}
