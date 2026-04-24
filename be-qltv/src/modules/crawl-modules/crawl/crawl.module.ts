import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CrawlController } from './crawl.controller';
import { CrawlService } from './crawl.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>(
                'RABBITMQ_URL',
                'amqp://localhost:5672',
              ),
            ],
            queue: configService.get<string>(
              'RABBITMQ_QUEUE',
              'file_upload_queue',
            ),
            queueOptions: {
              durable: true, // Giữ queue không bị mất khi restart Docker
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [CrawlController],
  providers: [CrawlService],
  exports: [CrawlService],
})
export class CrawlModule {}
