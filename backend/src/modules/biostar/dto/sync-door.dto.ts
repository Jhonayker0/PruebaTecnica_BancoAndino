import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Status } from '@prisma/client';

export class SyncDoorDto {
  @IsNumber()
  siteId!: number;

  @IsString()
  @IsNotEmpty()
  siteCode!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(Status)
  status!: Status;
}
