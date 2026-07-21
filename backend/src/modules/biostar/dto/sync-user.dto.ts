import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Status } from '@prisma/client';

export class SyncUserDto {
  @IsNumber()
  employeeId!: number;

  @IsString()
  @IsNotEmpty()
  documentNumber!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEnum(Status)
  status!: Status;
}
