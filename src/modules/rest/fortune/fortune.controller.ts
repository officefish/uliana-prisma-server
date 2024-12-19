import { Player } from '@/common/decorators';
import { BadRequestException, Controller, Get, Logger, NotFoundException, Post, Req, Res, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  //ApiBearerAuth,
} from '@nestjs/swagger';
import { PlayerGuard } from '../player/guards/player.guard';
import { FortuneService } from './fortune.service';
import { FastifyRequest, FastifyReply } from 'fastify'; // Импорт FastifyRequest
import { PrismaService } from '@/modules/prisma/prisma.service';
import { PlayerService } from '../player/player.service';
import { BalanceService } from '../balance/balance.service';
import { ActionGameplayService } from '../action/action.gameplay.service';


@ApiTags('fortune')
@Controller('fortune')
export class FortuneController {

    public readonly BAWDRY_PRICE  = 1; // temp price, use mongodb fortune template instead 

    private readonly logger = new Logger(FortuneController.name);
    constructor(
        private readonly  fortuneService: FortuneService,
        private readonly prisma: PrismaService, // Ensure proper readonly
        private readonly playerService: PlayerService, // Ensure proper readonly
        private readonly balanceService: BalanceService, // Ensure proper readonly
        private readonly gameplay: ActionGameplayService, // Ensure proper readonly
    ) {}

    @Get("/bawdry")
    @Player()
    @UseGuards(PlayerGuard)
    @ApiOperation({ summary: 'Get random bawdry' })
    @ApiResponse({ status: 200, description: 'Success response with Ok status gives \"pong\" string as response' })
    async getBawdry(
        @Req() req: FastifyRequest,
        @Res() reply: FastifyReply
    ) {

        const tgId = req.currentUser?.tgId

        if (!tgId) {
            const msg = `No tgId provided in jwt token`
            this.logger.error(msg)
            throw new BadRequestException(msg)
        }

        this.logger.debug(`Get bawdry for tgId: ${tgId}`)

        const player = await this.playerService.getPlayerByTgId(tgId)

        if (!player) {
            const msg = `No player found with tgId: ${tgId}`
            this.logger.error(msg)
            throw new NotFoundException(msg)
        }

        const balance = await this.balanceService.getBalanceByTgId(tgId)

        if (!balance) {
            const msg = `No player balance found with tgId: ${tgId}`
            this.logger.error(msg)
            throw new NotFoundException(msg)
        }

        if (balance.gems < 1) {
            const msg = `Player with tgId: ${tgId} ${balance.gems} gems needed.`
            this.logger.error(msg)
            throw new BadRequestException(msg)
        }

        const bawdry = await this.fortuneService.getRandomBawdry()

        const actionInstance = await this.gameplay.createBawdryActionInstance(player.id);
        const updatedBalance = await this.balanceService.removeGemsByTgId(tgId, 1);

        if (!updatedBalance) {
            const msg = `Insufficient gems to get bawdry.  Player with tgId: ${tgId} has ${balance.gems} gems.`
            this.logger.error(msg)
            throw new BadRequestException(msg)
        }

        if (bawdry) {
            this.logger.debug(`Success getting bawdry for tgId: ${req.currentUser?.tgId}`)
        }

        return reply.type('application/json').send({bawdry, balance: updatedBalance, actionInstance  });
    }

    @Get("/all")
    @Player()
    @UseGuards(PlayerGuard)
    @ApiOperation({ summary: 'Get player fortunes' })
    @ApiResponse({ status: 200, description: 'Success response with Ok status gives \"pong\" string as response' })
    getAllPlayerFortunes() {
        return [
        {
            key: "bawdry",
            price: { 
                value: 1,
                type: 'GEMS'
            }
        },
        {
            key: "lantern",
            price: { 
                value: 1,
                type: 'GEMS'
            }
        },
    
    ]}
}

