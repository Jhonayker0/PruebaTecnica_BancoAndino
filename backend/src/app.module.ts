import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { SitesModule } from './modules/sites/sites.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { AccessModule } from './modules/access/access.module';

@Module({
  imports: [PrismaModule, EmployeesModule, SitesModule, AssignmentsModule, AccessModule],
})
export class AppModule {}
