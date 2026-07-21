import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
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
  findHistory(@Query('siteId') siteId?: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.accessService.findHistory(undefined, siteId ? Number(siteId) : undefined, from, to);
  }

  @Get('history/export')
  async exportHistory(
    @Res() response: Response,
    @Query('siteId') siteId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const exportedFile = await this.accessService.exportHistory(siteId ? Number(siteId) : undefined, from, to);

    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.setHeader('Content-Disposition', `attachment; filename="${exportedFile.filename}"`);

    return response.send(exportedFile.buffer);
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
