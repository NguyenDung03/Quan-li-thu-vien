import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ReadersModule } from './readers/readers.module';
import { ReaderTypesModule } from './reader-types/reader-types.module';

@Module({
  imports: [UsersModule, ReadersModule, ReaderTypesModule],
})
export class UserModulesModule {}
