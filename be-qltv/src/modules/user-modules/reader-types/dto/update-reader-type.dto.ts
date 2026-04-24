import { PartialType } from '@nestjs/swagger';
import { CreateReaderTypeDto } from './create-reader-type.dto';

export class UpdateReaderTypeDto extends PartialType(CreateReaderTypeDto) {}
