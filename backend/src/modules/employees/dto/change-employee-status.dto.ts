import { Status } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ChangeEmployeeStatusDto {
  @IsEnum(Status)
  status!: Status;
}
