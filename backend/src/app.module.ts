import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { SitesModule } from './modules/sites/sites.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { AccessModule } from './modules/access/access.module';
import { CatalogsModule } from './modules/catalogs/catalogs.module';
import { ImportsModule } from './modules/imports/imports.module';
import { BiostarModule } from './modules/biostar/biostar.module';

@Module({
  imports: [PrismaModule, EmployeesModule, SitesModule, AssignmentsModule, AccessModule, CatalogsModule, ImportsModule, BiostarModule],
})
export class AppModule {}
