import { IsInt, Min } from 'class-validator';

export class AssignEmployeeToSiteDto {
  @IsInt()
  @Min(1)
  employeeId!: number;

  @IsInt()
  @Min(1)
  siteId!: number;
}
