import { IsInt, Min } from 'class-validator';

export class RegisterAccessDto {
  @IsInt()
  @Min(1)
  employeeId!: number;

  @IsInt()
  @Min(1)
  siteId!: number;
}
