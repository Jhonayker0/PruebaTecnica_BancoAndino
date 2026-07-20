import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { RegisterAccessDto } from './dto/register-access.dto';
import { AccessService } from './access.service';

@Controller('access')
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Post('entry')
  registerEntry(@Body() registerAccessDto: RegisterAccessDto) {
    return this.accessService.registerEntry(registerAccessDto);
  }

  @Post('exit')
  registerExit(@Body() registerAccessDto: RegisterAccessDto) {
    return this.accessService.registerExit(registerAccessDto);
  }

  @Get('history')
  findHistory(@Query('employeeId') employeeId?: string, @Query('siteId') siteId?: string) {
    return this.accessService.findHistory(
      employeeId ? Number(employeeId) : undefined,
      siteId ? Number(siteId) : undefined,
    );
  }

  @Get('occupancy')
  getCurrentOccupancy() {
    return this.accessService.getCurrentOccupancy();
  }

  @Get('without-exit')
  findEmployeesWithoutExit() {
    return this.accessService.findEmployeesWithoutExit();
  }
}
