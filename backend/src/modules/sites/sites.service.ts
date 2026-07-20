import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Status } from '@prisma/client';
import { DuplicateEntityError } from '../../common/exceptions/repository-exceptions';
import { SitesRepository } from './repositories/sites.repository';
import { ChangeSiteStatusDto } from './dto/change-site-status.dto';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

@Injectable()
export class SitesService {
  constructor(private readonly sitesRepository: SitesRepository) {}

  async create(createSiteDto: CreateSiteDto) {
    try {
      return await this.sitesRepository.create({
        siteCode: createSiteDto.siteCode,
        name: createSiteDto.name,
        city: createSiteDto.city,
        country: createSiteDto.country,
        address: createSiteDto.address,
        status: createSiteDto.status ?? Status.ACTIVE,
      });
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  findAll(search?: string) {
    return this.sitesRepository.findMany(search);
  }

  async findOne(id: number) {
    const site = await this.sitesRepository.findById(id);

    if (!site) {
      throw new NotFoundException(`Site with id ${id} not found`);
    }

    return site;
  }

  async update(id: number, updateSiteDto: UpdateSiteDto) {
    await this.ensureSiteExists(id);

    try {
      return await this.sitesRepository.update(id, {
        siteCode: updateSiteDto.siteCode,
        name: updateSiteDto.name,
        city: updateSiteDto.city,
        country: updateSiteDto.country,
        address: updateSiteDto.address,
        status: updateSiteDto.status,
      });
    } catch (error) {
      this.handleRepositoryError(error);
    }
  }

  async changeStatus(id: number, changeSiteStatusDto: ChangeSiteStatusDto) {
    await this.ensureSiteExists(id);

    return this.sitesRepository.update(id, {
      status: changeSiteStatusDto.status,
    });
  }

  private async ensureSiteExists(id: number): Promise<void> {
    const siteExists = await this.sitesRepository.existsById(id);

    if (!siteExists) {
      throw new NotFoundException(`Site with id ${id} not found`);
    }
  }

  private handleRepositoryError(error: unknown): never {
    if (error instanceof DuplicateEntityError) {
      throw new ConflictException('Site already exists with the same unique value');
    }

    throw error instanceof Error ? error : new Error('Unexpected Prisma error');
  }
}
