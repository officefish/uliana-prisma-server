import { Controller, Get, Logger, NotFoundException, Post, Req, Res, UseGuards } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify'; // Импорт FastifyRequest

import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PlayerGuard } from '../player/guards/player.guard';
import { PlayerService } from '../player/player.service';
import { BalanceService } from './balance.service';

@ApiTags('balance')
@Controller('balance')
export class BalanceController {

    private logger = new Logger(BalanceController.name);

    constructor(
        private readonly balanceService: BalanceService,
        private readonly playerService: PlayerService
      ) {}

    @UseGuards(PlayerGuard)
    @Get()
    @ApiOperation({ summary: 'Get player balance model by tgId' })
    @ApiResponse({ status: 200, description: 'Success response with Ok status gives player balance' })
    async getPlayerBalanceByTgId(
        @Req() req: FastifyRequest,
        @Res() reply: FastifyReply
    ) {
        const { tgId } = req.currentUser
        this.logger.log(`Get player data with tgId: ${tgId} using jwt token`);

        const player = await this.playerService.getPlayerByTgId(tgId)
        if (!player) {
            const msg = `No player found with tgId: ${tgId}`
            this.logger.error(msg)
            throw new NotFoundException(msg)
        }

        let balance = await this.balanceService.getBalanceByTgId(tgId)

        if (!balance) {
            balance = await this.balanceService.createBalanceForPlayer(player)
        }

        return reply.type('application/json').send({balance});
    }

    
}
