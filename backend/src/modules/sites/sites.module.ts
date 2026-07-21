import { Module } from '@nestjs/common';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';
import { PrismaSitesRepository } from './repositories/prisma-sites.repository';
import { SitesRepository } from './repositories/sites.repository';

@Module({
  controllers: [SitesController],
  providers: [
    SitesService,
    {
      provide: SitesRepository,
      useClass: PrismaSitesRepository,
    },
  ],
  exports: [SitesRepository],
})
export class SitesModule {}
