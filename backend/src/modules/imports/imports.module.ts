import { Module } from '@nestjs/common';
import { AssignmentsModule } from '../assignments/assignments.module';
import { EmployeesModule } from '../employees/employees.module';
import { SitesModule } from '../sites/sites.module';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';

@Module({
  imports: [EmployeesModule, SitesModule, AssignmentsModule],
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportsModule {}