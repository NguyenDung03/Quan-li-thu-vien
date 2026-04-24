import { PartialType } from '@nestjs/swagger';
import { CreatePhysicalCopyDto } from './create-physical-copy.dto';

export class UpdatePhysicalCopyDto extends PartialType(CreatePhysicalCopyDto) {}
