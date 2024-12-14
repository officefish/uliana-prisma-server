import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { Player } from '@prisma/client';

@Injectable()
export class BalanceService {
  //public readonly KEY_GENERATION_INTERVAL = 4 * 60 * 60 * 1000; // 4 часа в миллисекундах
  
  private readonly logger = new Logger(BalanceService.name)  

  constructor(private prisma: PrismaService) {}

  
  async getBalanceByTgId(tgId) {
    return this.prisma.playerBalance.findUnique({ where: tgId })
  }

  async createBalanceForPlayer(player: Player) {
    const balance = await this.prisma.playerBalance.create({
        data: {
          player: {
            connect: {
              id: player.id,
            },
          },
          playerTgId: player.tgAccountId,
          coins: 999,
          gems: 9,
          crystals: 3,
          energyLatest: 333,
          energyMax: 333,
          recoveryRate: 1,
          lastEnergyUpdate: new Date(),
        },
      });
      return balance;
  }

}