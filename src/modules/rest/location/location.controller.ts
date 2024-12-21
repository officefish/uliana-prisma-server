import { Player } from '@/common/decorators';
import { BadRequestException, Body, Controller, Get, Logger, NotFoundException, Post, Req, Res, UseGuards } from '@nestjs/common';
import {
    ApiOperation,
  ApiResponse,
  //ApiOperation,
  //ApiResponse,
  ApiTags,
  //ApiBearerAuth,
} from '@nestjs/swagger';
import { PlayerGuard } from '../player/guards/player.guard';
import { FastifyRequest, FastifyReply } from 'fastify'; // Импорт FastifyRequest
import { PlayerService } from '../player/player.service';
import { LocationService } from './location.service';


@ApiTags('location')
@Controller('location')
export class LocationController {

    private readonly logger = new Logger(LocationController.name);

    constructor(
        private readonly playerService: PlayerService, // Ensure proper readonly
        private readonly locationService: LocationService, // Ensure proper readonly
    ) {}
    
    @Get("/current")
    @Player()
    @UseGuards(PlayerGuard)
    @ApiOperation({ summary: 'Get random bawdry' })
    @ApiResponse({ status: 200, description: 'Success response with Ok status gives \"pong\" string as response' })
    async getCurrentLocation(
        @Req() req: FastifyRequest,
        @Res() reply: FastifyReply
    ) {

        const tgId = req.currentUser?.tgId

        if (!tgId) {
            const msg = `No tgId provided in jwt token`
            this.logger.error(msg)
            throw new BadRequestException(msg)
        }

        this.logger.debug(`Get location for tgId: ${tgId}`)

        const player = await this.playerService.getPlayerByTgIdWithLocation(tgId)

        if (!player) {
            const msg = `No player found with tgId: ${tgId}`
            this.logger.error(msg)
            throw new NotFoundException(msg)
        }

        if (player.location) {
            reply.status(200).send({location: player.location});
        }

        const locationTemplate = await this.locationService.getDefaultTemplate();

        let location = await this.locationService.getPlayerLocationImstance(player);

        if (!location) {
            location = await this.locationService.createLocationInstance(player, locationTemplate);
        }

        return reply.type('application/json').send({ location });  
    }

    @Post("/select")
    @Player()
    @UseGuards(PlayerGuard)
    @ApiOperation({ summary: 'Select current player location' })
    @ApiResponse({ status: 200, description: 'Success response with Ok status gives location model' })
    async selecttLocation(
        @Req() req: FastifyRequest,
        @Res() reply: FastifyReply,
        @Body() body: { location: string }
    ) {
        const tgId = req.currentUser?.tgId

        if (!tgId) {
            const msg = `No tgId provided in jwt token`
            this.logger.error(msg)
            throw new BadRequestException(msg)
        }

        this.logger.log(`Location for tgId: ${tgId} was selected. Trying to update`)

        const player = await this.playerService.getPlayerByTgIdWithLocation(tgId)

        if (!player) {
            const msg = `No player found with tgId: ${tgId}`
            this.logger.error(msg)
            throw new NotFoundException(msg)
        }

        const location = await this.locationService.selectPlayerLocation(player, body.location);

        if (location) {
            this.logger.log(`Location for tgId: ${tgId} successfully selected.`)
        }

        return reply.type('application/json').send({ location });  
    }
}

