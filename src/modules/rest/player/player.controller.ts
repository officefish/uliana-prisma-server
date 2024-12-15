import { Controller, Get, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify'; // Импорт FastifyRequest

import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PlayerGuard } from './guards/player.guard';
import { Player } from '@/common/decorators';
import { PlayerService } from './player.service';


@ApiTags('player')
@Controller('player')
export class PlayerController {

    private logger = new Logger(PlayerController.name);

    constructor(
        private readonly playerService: PlayerService
      ) {}

    @UseGuards(PlayerGuard)
    @Get("/by/tgId")
    @Player()
    @ApiOperation({ summary: 'Get player model with telegram account inside' })
    @ApiResponse({ status: 200, description: 'Success response with Ok status gives player with tg account' })
    async getPlayerByTgId(
        @Req() req: FastifyRequest,
        @Res() reply: FastifyReply
    ) {
        const { tgId } = req.currentUser
        this.logger.log(`Get player data with tgId: ${tgId} using jwt token`);

        const player = await this.playerService.getPlayerByTgId(tgId)
        if (player) {
            this.logger.log(`Success getting player data with tgId: ${tgId} using jwt token`)
        }

        return reply.type('application/json').send({player});
    }

     // @UseGuards(PlayerGuard)
    // @Get()
    // @ApiOperation({ summary: 'Get single player model' })
    // @ApiResponse({ status: 200, description: 'Success response single player model' })
    // async getPlayer(
    //     @Req() req: FastifyRequest,
    //     @Res() reply: FastifyReply
    // ) {
    //     const { tgId } = req.currentUser
    //     this.logger.log(`Get player data with tgId: ${tgId} using jwt token`);
    
    //     const player = await this.playerService.getPlayer(id)
        

    //     return "player"
    // }
}
