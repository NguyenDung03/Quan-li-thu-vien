import { Module } from '@nestjs/common';
import { EbooksModule } from './ebooks/ebooks.module';
import { LocationsModule } from './locations/locations.module';
import { PhysicalCopiesModule } from './physical-copies/physical-copies.module';

@Module({
  imports: [LocationsModule, PhysicalCopiesModule, EbooksModule],
})
export class InventoryModulesModule {}
