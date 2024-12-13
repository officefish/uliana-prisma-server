import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    Res,
    NotFoundException,
    Logger,
  } from '@nestjs/common'
  import { ReferralsService } from './referrals.service'
  import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
  } from '@nestjs/swagger'
  import { CurrentUser, Player } from '@/common/decorators'
  import { PlayerTokenDTO } from '@/modules/token/dto'

  import { FastifyRequest, FastifyReply } from 'fastify';
  
  import { 
    GetReferralsQueryDto,
} from './dto'
import { PrismaService } from '@modules/prisma/prisma.service'
  
  @ApiTags('referrals')
  @ApiBearerAuth()
  @Controller('referrals')
  export class ReferralsController {
    private logger = new Logger(ReferralsController.name)
    constructor(
      private readonly referralsService: ReferralsService,
      private readonly prisma: PrismaService,
    ) {}
  
    @Get()
    @ApiOperation({ summary: 'Get referrals' })
    @ApiResponse({ status: 200, description: 'List of referrals.' })
    @ApiResponse({ status: 404, description: 'Player not found.' })
    async getReferrals(
      @CurrentUser() currentUser: PlayerTokenDTO,
      @Query() query: GetReferralsQueryDto,
    ) {
      const { tgId } = currentUser
      this.logger.log(`Player with tgId: ${tgId} trying to get his referrals`);

      const account = await this.prisma.telegramAccount.findUnique({ where: { tgId } })
      if (!account) {
        const msg = `Player account with tgId: ${tgId} not found.`
        this.logger.error(new Error(msg));
        throw new NotFoundException(msg);
      }

      const player = await this.prisma.player.findUnique({ where: { tgAccountId: account.id }})
      if (!player) {
        const msg = `Player with tgId: ${tgId} not found.`
        this.logger.error(new Error(msg));
        throw new NotFoundException(msg);
      }

      const referrals = await this.referralsService.getReferrals(player, query);
      if (referrals) {
        this.logger.log(`Player with tgId: ${tgId} successfully got his referrals`);
      }
      return referrals;
    }


    @Post()
    @ApiResponse({
      status: 200,
      description: 'Get referrer by tgId',
      //type: GameplayTickResponse,
    })
    @Post()
    async getReferrerByTgId(
      @CurrentUser() currentUser: PlayerTokenDTO,
      @Body() body: GetReferralsQueryDto,
      @Res() reply: FastifyReply
    ) {
      const { tgId } = currentUser
      this.logger.log(`Player with tgId: ${tgId} trying to get his referrals`);
  
      const account = await this.prisma.telegramAccount.findUnique({ where: { tgId } })
      if (!account) {
        const msg = `Player account with tgId: ${tgId} not found.`
        this.logger.error(new Error(msg));
        throw new NotFoundException(msg);
      }

      const player = await this.prisma.player.findUnique({ 
        where: { tgAccountId: account.id },
        include: {
          invitations: true
        }
      })
      if (!player) {
        const msg = `Player with tgId: ${tgId} not found.`
        this.logger.error(new Error(msg));
        throw new NotFoundException(msg);
      }
      const count = player.invitations.length

      this.logger.log(`Player with tgId: ${tgId} successfully got his referrals`);
      return reply.type('application/json').send({player, count});
    }
  }