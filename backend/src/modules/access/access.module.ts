import { Module } from '@nestjs/common';
import { AccessController } from './access.controller';
import { AccessService } from './access.service';
import { AccessRepository } from './repositories/access.repository';
import { PrismaAccessRepository } from './repositories/prisma-access.repository';
import { BiostarModule } from '../biostar/biostar.module';

@Module({
  imports: [BiostarModule],
  controllers: [AccessController],
  providers: [
    AccessService,
    {
      provide: AccessRepository,
      useClass: PrismaAccessRepository,
    },
  ],
})
export class AccessModule {}
