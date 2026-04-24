import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import * as redisStore from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { DatabaseModule } from './config/database.module';
import { CatalogModulesModule } from './modules/catalog-modules/catalog-modules.module';
import { ChatModule } from './modules/chat-modules/chat.module';
import { CrawlModulesModule } from './modules/crawl-modules/crawl-modules.module';
import { InventoryModulesModule } from './modules/inventory-modules/inventory-modules.module';
import { MediaModulesModule } from './modules/media-modules/media-modules.module';
import { TransactionModulesModule } from './modules/transaction-modules/transaction-modules.module';
import { UserModulesModule } from './modules/user-modules/user-modules.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AdminModulesModule } from './modules/admin-modules/admin-modules.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    }),
    DatabaseModule,
    CloudinaryModule,
    UserModulesModule,
    ChatModule,
    CatalogModulesModule,
    CrawlModulesModule,
    InventoryModulesModule,
    MediaModulesModule,
    TransactionModulesModule,
    PaymentModule,
    AdminModulesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
