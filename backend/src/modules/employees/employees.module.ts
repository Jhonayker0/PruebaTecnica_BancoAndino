import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { EmployeesRepository } from './repositories/employees.repository';
import { PrismaEmployeesRepository } from './repositories/prisma-employees.repository';

@Module({
  controllers: [EmployeesController],
  providers: [
    EmployeesService,
    {
      provide: EmployeesRepository,
      useClass: PrismaEmployeesRepository,
    },
  ],
})
export class EmployeesModule {}
