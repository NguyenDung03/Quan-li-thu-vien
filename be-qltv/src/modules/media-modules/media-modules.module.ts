import { Module } from '@nestjs/common';
import { ImagesModule } from './images/images.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [ImagesModule, UploadsModule],
})
export class MediaModulesModule {}
