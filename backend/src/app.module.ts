import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { SitesModule } from './modules/sites/sites.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { AccessModule } from './modules/access/access.module';
import { CatalogsModule } from './modules/catalogs/catalogs.module';

@Module({
  imports: [PrismaModule, EmployeesModule, SitesModule, AssignmentsModule, AccessModule, CatalogsModule],
})
export class AppModule {}
