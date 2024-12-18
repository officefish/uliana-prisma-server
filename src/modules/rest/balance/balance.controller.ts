import { Body, Controller, Get, Logger, NotFoundException, Post, Req, Res, UseGuards } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify'; // Импорт FastifyRequest

import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PlayerGuard } from '../player/guards/player.guard';
import { PlayerService } from '../player/player.service';
import { BalanceService } from './balance.service';
import { Player } from '@/common/decorators';

@ApiTags('balance')
@Controller('balance')
export class BalanceController {

    private logger = new Logger(BalanceController.name);

    constructor(
        private readonly balanceService: BalanceService,
        private readonly playerService: PlayerService
      ) {}

    @Player()
    @UseGuards(PlayerGuard)
    @Get()
    @ApiOperation({ summary: 'Get player balance model by tgId' })
    @ApiResponse({ status: 200, description: 'Success response with Ok status gives player balance' })
    async getPlayerBalanceByTgId(
        @Req() req: FastifyRequest,
        @Res() reply: FastifyReply
    ) {

        if (!req.currentUser?.tgId) {
            const msg = `No tgId provided in jwt token`
            this.logger.error(msg)
            throw new NotFoundException(msg)
        }

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

        const now = new Date();

        const lastGemReady = balance.lastGemReady ? balance.lastGemReady.getTime() : 0;
        if (now.getTime() - lastGemReady > this.balanceService.GEM_GENERATION_INTERVAL) {
            balance = await this.balanceService.incrementGemsByTimer(balance)
        }

        // const lastCrystalReady = balance.lastCrystalReady ? balance.lastCrystalReady.getTime() : 0;
        // if (now.getTime() - lastCrystalReady > this.balanceService.CRYSTAL_GENERATION_INTERVAL) {
        //     balance = await this.balanceService.incrementCrystalsByTimer(balance)
        // }

        return reply.type('application/json').send({balance});
    }

    @Player()
    @UseGuards(PlayerGuard)
    @Post("buy/gems")
    @ApiOperation({ summary: 'Buy new gems if player is authorized' })
    @ApiResponse({ status: 200, description: 'Success response with Ok status gives player balance' })
    async addGems(
        @Req() req: FastifyRequest,
        @Res() reply: FastifyReply,
        @Body() body: { numGems: number }
    ) {

        if (!req.currentUser?.tgId) {
            const msg = `No tgId provided in jwt token`
            this.logger.error(msg)
            throw new NotFoundException(msg)
        }

        const { tgId } = req.currentUser
        this.logger.log(`Player with tgId: ${tgId} trying buy ${body.numGems} gems`);

        const player = await this.playerService.getPlayerByTgId(tgId)
        if (!player) {
            const msg = `No player found with tgId: ${tgId}`
            this.logger.error(msg)
            throw new NotFoundException(msg)
        }

        const balance = await this.balanceService.addGemsByTgId(tgId, body.numGems)

        if (balance) {
            this.logger.log(`Player with tgId: ${tgId} successfuly bought ${body.numGems} gems`);
        }

        return reply.type('application/json').send({balance});
    }

    @Player()
    @UseGuards(PlayerGuard)
    @Post("balance/timer")
    @ApiOperation({ summary: 'Buy new gems if player is authorized' })
    @ApiResponse({ status: 200, description: 'Success response with Ok status gives player balance' })
    async getBalanceByTimer(
        @Req() req: FastifyRequest,
        @Res() reply: FastifyReply,
        @Body() body: { clicks : number, energy : number}
    ) {

        if (!req.currentUser?.tgId) {
            const msg = `No tgId provided in jwt token`
            this.logger.error(msg)
            throw new NotFoundException(msg)
        }

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

        const now = new Date();

        if (!balance.lastGemReady) {
            balance = await this.balanceService.incrementGemsByTimer(balance)
        }

        const lastGemReady = balance.lastGemReady ? balance.lastGemReady.getTime() : 0;
        if (now.getTime() - lastGemReady > this.balanceService.GEM_GENERATION_INTERVAL) {
            balance = await this.balanceService.incrementGemsByTimer(balance)
        }

        // if (!balance.lastCrystalReady) {
        //     balance = await this.balanceService.incrementCrystalsByTimer(balance)
        // }

        // const lastCrystalReady = balance.lastCrystalReady ? balance.lastCrystalReady.getTime() : 0;
        // if (now.getTime() - lastCrystalReady > this.balanceService.CRYSTAL_GENERATION_INTERVAL) {
        //     balance = await this.balanceService.incrementCrystalsByTimer(balance)
        // }

        return reply.type('application/json').send({balance});
    }
}
