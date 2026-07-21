import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportsService } from './imports.service';

interface UploadedExcelFile {
  originalname: string;
  buffer: Buffer;
}

@Controller('imports')
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('excel')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(@UploadedFile() file?: UploadedExcelFile) {
    if (!file) {
      throw new BadRequestException('Debes adjuntar un archivo .xlsx');
    }

    return this.importsService.importExcel(file);
  }
}