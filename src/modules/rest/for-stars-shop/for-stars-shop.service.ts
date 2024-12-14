import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from "@modules/prisma/prisma.service"; // Подключаем сервис Prisma
//import { RankType } from '@prisma/client';

@Injectable()
export class ForStarsShopService {
  private readonly logger = new Logger(ForStarsShopService.name);
  
  constructor(
    private readonly prisma: PrismaService, // Ensure proper readonly
  ) {}

  async buyKeys(numKeys: number) {
  }
}

