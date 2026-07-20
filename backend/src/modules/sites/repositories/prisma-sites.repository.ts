import { Injectable } from '@nestjs/common';
import { Prisma, Site } from '@prisma/client';
import { DuplicateEntityError } from '../../../common/exceptions/repository-exceptions';
import { PrismaService } from '../../../prisma/prisma.service';
import { SiteWithAssignments, SitesRepository } from './sites.repository';

@Injectable()
export class PrismaSitesRepository implements SitesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.SiteCreateInput): Promise<Site> {
    try {
      return await this.prisma.site.create({ data });
    } catch (error) {
      this.handlePrismaError(error, 'Site already exists with the same unique value');
    }
  }

  async findMany(search?: string): Promise<SiteWithAssignments[]> {
    return this.prisma.site.findMany({
      where: search
        ? {
            OR: [
              { siteCode: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
              { country: { contains: search, mode: 'insensitive' } },
              { address: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { id: 'desc' },
      include: {
        employeeSites: true,
      },
    });
  }

  async findById(id: number): Promise<SiteWithAssignments | null> {
    return this.prisma.site.findUnique({
      where: { id },
      include: {
        employeeSites: true,
      },
    });
  }

  async existsById(id: number): Promise<boolean> {
    const site = await this.prisma.site.findUnique({ where: { id }, select: { id: true } });
    return Boolean(site);
  }

  async update(id: number, data: Prisma.SiteUpdateInput): Promise<Site> {
    try {
      return await this.prisma.site.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handlePrismaError(error, 'Site already exists with the same unique value');
    }
  }

  private handlePrismaError(error: unknown, message: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new DuplicateEntityError(message);
    }

    throw error instanceof Error ? error : new Error('Unexpected Prisma error');
  }
}
