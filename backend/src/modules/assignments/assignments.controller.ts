import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AssignEmployeeToSiteDto } from './dto/assign-employee-to-site.dto';
import { AssignmentsService } from './assignments.service';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  assignEmployeeToSite(@Body() assignEmployeeToSiteDto: AssignEmployeeToSiteDto) {
    return this.assignmentsService.assignEmployeeToSite(assignEmployeeToSiteDto);
  }

  @Get('employees/:employeeId/sites')
  findSitesByEmployee(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.assignmentsService.findSitesByEmployee(employeeId);
  }

  @Get('sites/:siteId/employees')
  findEmployeesBySite(@Param('siteId', ParseIntPipe) siteId: number) {
    return this.assignmentsService.findEmployeesBySite(siteId);
  }

  @Delete(':id')
  removeAssignment(@Param('id', ParseIntPipe) id: number) {
    return this.assignmentsService.removeAssignment(id);
  }
}
