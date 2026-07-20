import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Status } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ChangeSiteStatusDto } from './dto/change-site-status.dto';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSiteDto: CreateSiteDto) {
    return this.prisma.site
      .create({
        data: {
          siteCode: createSiteDto.siteCode,
          name: createSiteDto.name,
          city: createSiteDto.city,
          country: createSiteDto.country,
          address: createSiteDto.address,
          status: createSiteDto.status ?? Status.ACTIVE,
        },
      })
      .catch((error: unknown) => this.handlePrismaError(error));
  }

  findAll(search?: string) {
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

  async findOne(id: number) {
    const site = await this.prisma.site.findUnique({
      where: { id },
      include: {
        employeeSites: true,
      },
    });

    if (!site) {
      throw new NotFoundException(`Site with id ${id} not found`);
    }

    return site;
  }

  async update(id: number, updateSiteDto: UpdateSiteDto) {
    await this.ensureSiteExists(id);

    return this.prisma.site
      .update({
        where: { id },
        data: {
          siteCode: updateSiteDto.siteCode,
          name: updateSiteDto.name,
          city: updateSiteDto.city,
          country: updateSiteDto.country,
          address: updateSiteDto.address,
          status: updateSiteDto.status,
        },
      })
      .catch((error: unknown) => this.handlePrismaError(error));
  }

  async changeStatus(id: number, changeSiteStatusDto: ChangeSiteStatusDto) {
    await this.ensureSiteExists(id);

    return this.prisma.site.update({
      where: { id },
      data: {
        status: changeSiteStatusDto.status,
      },
    });
  }

  private async ensureSiteExists(id: number): Promise<void> {
    const site = await this.prisma.site.findUnique({ where: { id }, select: { id: true } });

    if (!site) {
      throw new NotFoundException(`Site with id ${id} not found`);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Site already exists with the same unique value');
    }

    throw error instanceof Error ? error : new Error('Unexpected Prisma error');
  }
}
