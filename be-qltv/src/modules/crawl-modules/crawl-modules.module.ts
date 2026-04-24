import { Module } from '@nestjs/common';
import { CrawlModule } from './crawl/crawl.module';
import { DocumentModule } from './document/document.module';

@Module({
  imports: [CrawlModule, DocumentModule],
  exports: [CrawlModule, DocumentModule],
})
export class CrawlModulesModule {}
