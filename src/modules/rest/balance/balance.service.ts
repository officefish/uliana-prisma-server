import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { Player, PlayerBalance } from '@prisma/client';

@Injectable()
export class BalanceService {    
  public readonly GEM_GENERATION_INTERVAL = 4 * 60 * 60 * 1000; // 4 часа в миллисекундах
  public readonly CRYSTAL_GENERATION_INTERVAL = 48 * 60 * 60 * 1000; // 4 часа в миллисекундах

  
  private readonly logger = new Logger(BalanceService.name)  

  constructor(private prisma: PrismaService) {}

  
  async getBalanceByTgId(tgId: string) {

    const account = await this.prisma.telegramAccount.findUnique({ where: { tgId } })
    if (!account) {
      return null
    }

    const player = await this.prisma.player.findUnique({ where: { tgAccountId: account.id }})
    if (!player) {
      return null
    }

    if (!player.balanceId) {
      return null
    }

    return this.prisma.playerBalance.findUnique(
      { where: { id: player.balanceId }
    })
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

  async addGemsByTgId(tgId, gems: number) {
    const balance = await this.getBalanceByTgId(tgId)
    if (!balance) {
      throw new NotFoundException('Player balance not found')
    }
    const updatedBalance = await this.prisma.playerBalance.update({
      where: { id: balance.id },
      data: { gems: balance.gems + gems },
    });
    return updatedBalance;
  }

  async removeGemsByTgId(tgId: string, gems: number) {
    const balance = await this.getBalanceByTgId(tgId)
    if (!balance) {
      throw new NotFoundException('Player balance not found')
    }
    const updatedBalance = await this.prisma.playerBalance.update({
      where: { id: balance.id },
      data: { gems: balance.gems - gems },
    });
    return updatedBalance;
  }

  async incrementGemsByTimer(balance: PlayerBalance) {
    // Функция сброса счетчика ключей, если пользователь был неактивен более 4 часов
    
    return await this.prisma.playerBalance.update({
      where: { id: balance.id },
      data: { 
        gems: balance.gems + 1,
        lastGemReady: new Date(),
      },
    });
  }

  async incrementCrystalsByTimer(balance: PlayerBalance) {
    // Функция сброса счетчика ключей, если пользователь был неактивен более 4 часов
  
    return await this.prisma.playerBalance.update({
      where: { id: balance.id },
      data: { 
        gems: balance.crystals + 1,
        lastCrystalReady: new Date(),
      },
    });
  }

}