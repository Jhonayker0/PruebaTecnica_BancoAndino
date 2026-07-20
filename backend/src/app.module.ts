import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { SitesModule } from './modules/sites/sites.module';

@Module({
  imports: [PrismaModule, EmployeesModule, SitesModule],
})
export class AppModule {}
