import { Body, Controller, Get, Logger, NotFoundException, Post, Req, Res, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  //ApiBearerAuth,
} from '@nestjs/swagger';
import { PlayerGuard } from '../player/guards/player.guard';
import { Player } from '@/common/decorators';
import { FastifyRequest, FastifyReply } from 'fastify'; // Импорт FastifyRequest
import { PrismaService } from '../../prisma/prisma.service';
import { TelegramService } from '../../telegram/telegram.service';
import { PlayerService } from '../player/player.service';

@ApiTags('for-stars-shop')
@Controller('for-stars-shop')
export class ForStarsShopController {
    private logger = new Logger(ForStarsShopController.name)

    constructor(
        private readonly prisma: PrismaService, 
        private readonly telegramService: TelegramService,
        private readonly playerService: PlayerService
      ) {}
        
    @ApiResponse({
        status: 200,
        description: 'Player successfully bought keys',
        //type: PlayerEnergyResponse,
      })
      @UseGuards(PlayerGuard)
      @Post('gems/buy')
      @Player()
      async buyKeys(
        @Body() body: { numGems: number },
        @Req() req: FastifyRequest,
        @Res() reply: FastifyReply
      ) {
        const { tgId } = req.currentUser
        this.logger.log(`Player with tgId: ${tgId} triing to buy gems`)
        const player = await this.playerService.getPlayerByTgId(tgId)
        if (!player) {
          const msg = `Player with tgId: ${tgId} does not exist`
          this.logger.error(msg)
          throw new NotFoundException(msg);
        }

        const invoiceLink = await this.telegramService.byGemsForStars(body.numGems);
        return reply.type('application/json').send({ invoiceLink });
      }
}

