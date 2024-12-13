import {
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
  } from '@nestjs/common'

import { PrismaService } from '@modules/prisma/prisma.service'

import { TokenService } from '@modules/token/token.service'
import { PlayerTokenDTO } from '@modules/token/dto'
  
import { SuccessMessageType } from '@/helpers/common/types'
  
import { ReferralsService } from '@modules/rest/referrals/referrals.service'

import { v4 as uuidv4 } from 'uuid'; // Для генерации уникального кода
import { TelegramUnsafeInitDataDto } from './dto/telegram-initial.dto'
import { PlayerService } from '../player/player.service'
import { CreateTelegramAccountDto } from '../player/dto/player.dto'

    
  @Injectable()
  export class AuthService {
    private logger = new Logger(AuthService.name);
    constructor(
      private tokenService: TokenService,
      private prismaService: PrismaService,
      private referralService: ReferralsService,
      // private configService: ConfigService,
      private playerService: PlayerService
    ) {}
  
    async registerOrLogin(
      dto: TelegramUnsafeInitDataDto,
      unsafe: boolean
    ) {

      this.logger.log(`Attempting to register or login player: {username: ${dto.username}, id: ${dto.tgId}} `);
      
      const candidate = await this.playerService.getPlayerByTgId(String(dto.tgId))
  
      if (candidate) {
        this.logger.log(
          `Player {username: ${dto.username}, id: ${dto.tgId}} found, login in progress...`,
        );
        const tokens = this.tokenService.generateTokens({
          ...new PlayerTokenDTO(candidate),
        });
        await this.tokenService.saveTokens(new PlayerTokenDTO(candidate), tokens.refreshToken);

        const loginPlayer = await this.prismaService.player.update({
          where: { id: candidate.id },
          data: { lastLogin: new Date(), unsafe },
        })

        return {
          player: loginPlayer,
          ...tokens,
          isNew: false,
        };
      }
  
      this.logger.log(`Player not found {username: ${dto.username}, id: ${dto.tgId}}`);

      const generatedCode = uuidv4();  // Можно использовать другие методы генерации

      const tgAccount = {
        tgId: String(dto.tgId),
        username: dto.username,
        firstName: dto.firstName,
        lastName: dto.lastName,
        isPremiun: dto.isPremium
      } as CreateTelegramAccountDto

      const player = await this.playerService.createPlayer({
        tgAccount,
        referralCode: generatedCode,
        active: true
      })

      const tokens = this.tokenService.generateTokens({
        ...new PlayerTokenDTO(player),
      });
      await this.tokenService.saveTokens(new PlayerTokenDTO(player), tokens.refreshToken);
  
      this.logger.log('Player registered successfully!');

      const response = {
        message: 'Player registered successfully!',
        player,
        ...tokens,
        isNew: true,
      }
      return response
    }

    async initReferrer(referralCode: string) {
      let invitedBy = undefined;
      if (referralCode) {
        if (!this.isValidUUID(referralCode)) {
          return invitedBy;
          //throw new NotFoundException('Invalid referral code');
        }

        const referrer = await this.prismaService.player.findUnique({
          where: { referralCode },
        });

        if (referrer) {
          invitedBy = {
            connect: {
              id: referrer.id, // Указываем ID пригласившего игрока
            },
          };
          this.logger.log('Contact has been established with the player who made the referral code');
        } 
      }
      return invitedBy;
    }

    async updateReferrer(id: string, invitedBy: any) {
      return await this.prismaService.player.update({
        where: { id },
        data: { invitedBy },
      })
    }
  
    async logoutPlayer(refreshToken: string): Promise<SuccessMessageType> {
      this.logger.log('Попытка выхода пользователя...');
      if (!refreshToken) {
        this.logger.error('Не предоставлен обновляющий токен!');
        throw new UnauthorizedException('Refresh token not provided');
      }
  
      await this.tokenService.deleteToken(refreshToken);
      this.logger.log('Пользователь успешно вышел');
  
      return { message: 'Player logged out' };
    }
  
    async refreshTokens(refreshToken: string) {
      this.logger.log('Попытка обновления токенов...');
      if (!refreshToken) {
        this.logger.error('Не предоставлен обновляющий токен!');
        throw new UnauthorizedException('Refresh token not provided!');
      }
  
      const tokenFromDB = await this.tokenService.findToken(refreshToken);
      const validToken = this.tokenService.validateRefreshToken(refreshToken);
  
      if (!validToken || !tokenFromDB) {
        const msg = `Invalid refresh token: ${refreshToken}`
        this.logger.error(new Error(msg));
        throw new UnauthorizedException(msg);
      }
  
      const player = await this.findPlayerById(validToken.id);
  
      if (!player) {
        const msg = `Player with ID ${validToken.id} not found!`;
        this.logger.error(new Error(msg));
        throw new UnauthorizedException(msg);
      }
  
      const tokens = this.tokenService.generateTokens({
        ...new PlayerTokenDTO(player),
      });
  
      await this.tokenService.saveTokens(new PlayerTokenDTO(player), tokens.refreshToken);
  
      const responseMsg = `Tokens for player with ${player.tgAccount.tgId} have been successfully refreshed!` 
      this.logger.log(responseMsg);
      return {
        ...tokens,
        player,
      };
    }
  
    private async findPlayerById(playerId: string) {
      this.logger.log(`Find player with database ID ${playerId}...`);
      const player = await this.playerService.getPlayerById(playerId)
      if (!player) {
        const msg = `Player ${playerId} not found!`;
        this.logger.error(new Error(msg));
        throw new NotFoundException(msg);
      }
      return player;
    }

    isValidUUID(uuid) {
      // Регулярное выражение для проверки формата UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(uuid);
    }

    parseReferrerIdString(str) {
      
        // Разбиваем строку по знаку "="
        const parts = str.split("=");
        if (parts.length === 2) {
            const referrerId = parts[0];
            const uuid = parts[1];

            // Проверяем, является ли вторая часть валидным UUID
            if (this.isValidUUID(uuid)) {
                return {
                    referrerId: referrerId,
                    separator: "=",
                    uuid: uuid
                };
            } else {
              return null
              //return "Ошибка: Неверный формат UUID.";
            }
        } else {
          return null  
          //return "Ошибка: Строка имеет неправильный формат.";
        }
    
    }
  
  }