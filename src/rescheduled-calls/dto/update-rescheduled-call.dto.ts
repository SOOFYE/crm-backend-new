import { PartialType } from '@nestjs/swagger';
import { CreateRescheduledCallDto } from './create-rescheduled-call.dto';

export class UpdateRescheduledCallDto extends PartialType(CreateRescheduledCallDto) {}
