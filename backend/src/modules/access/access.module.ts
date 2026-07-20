import { Module } from '@nestjs/common';
import { AccessController } from './access.controller';
import { AccessService } from './access.service';
import { AccessRepository } from './repositories/access.repository';
import { PrismaAccessRepository } from './repositories/prisma-access.repository';

@Module({
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
