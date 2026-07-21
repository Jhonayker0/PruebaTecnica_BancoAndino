import { Module } from '@nestjs/common';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { AssignmentsRepository } from './repositories/assignments.repository';
import { PrismaAssignmentsRepository } from './repositories/prisma-assignments.repository';

@Module({
  controllers: [AssignmentsController],
  providers: [
    AssignmentsService,
    {
      provide: AssignmentsRepository,
      useClass: PrismaAssignmentsRepository,
    },
  ],
  exports: [AssignmentsRepository],
})
export class AssignmentsModule {}
