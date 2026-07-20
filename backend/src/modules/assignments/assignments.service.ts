import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignEmployeeToSiteDto } from './dto/assign-employee-to-site.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async assignEmployeeToSite(assignEmployeeToSiteDto: AssignEmployeeToSiteDto) {
    try {
      return await this.prisma.employeeSite.create({
        data: {
          employeeId: assignEmployeeToSiteDto.employeeId,
          siteId: assignEmployeeToSiteDto.siteId,
        },
        include: {
          employee: true,
          site: true,
        },
      });
    } catch (error: unknown) {
      this.handlePrismaError(error);
    }
  }

  findSitesByEmployee(employeeId: number) {
    return this.prisma.employeeSite.findMany({
      where: { employeeId },
      include: {
        site: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findEmployeesBySite(siteId: number) {
    return this.prisma.employeeSite.findMany({
      where: { siteId },
      include: {
        employee: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async removeAssignment(id: number) {
    const assignment = await this.prisma.employeeSite.findUnique({ where: { id }, select: { id: true } });

    if (!assignment) {
      throw new NotFoundException(`Assignment with id ${id} not found`);
    }

    return this.prisma.employeeSite.delete({ where: { id } });
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Employee is already assigned to this site');
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Employee or site not found');
      }
    }

    throw error instanceof Error ? error : new Error('Unexpected Prisma error');
  }
}
