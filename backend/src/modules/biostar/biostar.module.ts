import { Module } from '@nestjs/common';
import { BiostarController } from './biostar.controller';
import { BiostarService } from './biostar.service';
import { EmployeesModule } from '../employees/employees.module';
import { SitesModule } from '../sites/sites.module';

@Module({
  imports: [EmployeesModule, SitesModule],
  controllers: [BiostarController],
  providers: [BiostarService],
  exports: [BiostarService],
})
export class BiostarModule {}
