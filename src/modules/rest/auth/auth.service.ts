import {
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
  } from '@nestjs/common'

import { PrismaService } from '@modules/prisma/prisma.service'

import { TokenService } from '@modules/token/token.service'
import { PlayerTokenDTO, PlayerWithTgAccount } from '@modules/token/dto'
  
import { SuccessMessageType } from '@/helpers/common/types'
  
import { ReferralsService } from '@modules/rest/referrals/referrals.service'

import { v4 as uuidv4 } from 'uuid'; // Для генерации уникального кода
import { TelegramUnsafeInitDataDto } from './dto/telegram-initial.dto'
import { PlayerService } from '../player/player.service'
import { CreateTelegramAccountDto } from '../player/dto/player.dto'
import { TelegramUserType } from '@/helpers/types/telegram-user.type'
import { ActionInstance, Prisma } from '@prisma/client'

    
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
          include: {
            tgAccount: true
          }
        })

        return {
          player: loginPlayer,
          ...tokens,
          isNew: false,
          action: null
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
        active: true,
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
        action: null
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
        include: {
          tgAccount: true,
        },
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

    parseActionUUIDString(str) {
      
      // Разбиваем строку по знаку "="
      const parts = str.split("=");
      if (parts.length === 2) {
          const action = parts[0];
          const uuid = parts[1];

          // Проверяем, является ли вторая часть валидным UUID
          if (this.isValidUUID(uuid)) {
              return {
                  action,
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

    async registerOrLoginWithReferrer(
      dto: TelegramUnsafeInitDataDto,
      unsafe: boolean, 
      command: string
    ) {
      const parsedCommand = this.parseReferrerIdString(command)
      const referralCode = parsedCommand?.uuid || null
          
      const response = await this.registerOrLogin(dto, unsafe);
          
      /* Если пользователь пытается зарегистрировать сам себя, то игнорируем эту попытку */
      if (response.player.referralCode === referralCode) {
        this.logger.warn(`Player with tgId: ${dto.tgId} triing refer himself.`);
        this.logger.log(`Player data: ${JSON.stringify(response)}`)
        return response
      }
          
      /* Если пользователь уже зарегистрирова, то игнорируем попытку активации приглашения */
      if (!response.isNew) {
        this.logger.warn(`Player with tgId: ${dto.tgId} not new user.`);
        this.logger.log(`Player data: ${JSON.stringify(response)}`)
        return response
      }
          
      const referrer = await this.referralService.findByReferralCode(referralCode);
        
      if (referrer) {
        await this.referralService.trackReferral(referrer.id, response.player.id);
        await this.referralService.rewardReferrer(referrer.id);
        let invitedBy = await this.initReferrer(referralCode);
        const playerWithReferrer = await this.updateReferrer(response.player.id, invitedBy)
        response.player = playerWithReferrer
        this.logger.log(`Player with tgId: ${dto.tgId} now is refferal for user with tgId: ${referrer.tgAccount.tgId}.`);
      }

      return response
    }

    async registerOrLoginWithAction(
      dto: TelegramUnsafeInitDataDto,
      unsafe: boolean, 
      command: string
    ) {
      const parsedCommand = this.parseActionUUIDString(command)
      const uuid = parsedCommand?.uuid || ''
          
      const auth = await this.registerOrLogin(dto, unsafe);
      
      /* Если пользователь пытается зарегистрировать сам себя, то игнорируем эту попытку */
      const action = await this.prismaService.actionInstance.findUnique({
        where: { uuid: uuid } 
      })

      if (!action) {
        this.logger.warn("Action with UUID: " + uuid + " not found.")
        return { auth }
      }

      const player = await this.playerService.getPlayerByTgId(String(dto.tgId))
      
      if (!player) {
        this.logger.warn(`Player with tgId: ${dto.tgId} not found.`);
        return { auth }
      }
      
      if (action.playerId === player.id) {
        this.logger.log(`Player with tgId: ${dto.tgId} trying to use action himself with no effect`);
        return { auth }
      }

      if (action.targetId === player.id) {
        this.logger.log(`Player with tgId: ${dto.tgId} opens old action`);
        auth.action = action
        return { auth }
      }

      if (action.targetId) {
        this.logger.log(`Player with tgId: ${dto.tgId} opens already used action`);
        return { auth }
      }

      const updateAction = await this.prismaService.actionInstance.update({
        where: { id: action.id },
        data: {
          target: {
            connect: { id: player.id }, // Устанавливаем связь с указанным targetId
          },
        },
        include: {
          template: true
        }
      })

      if (updateAction) {
        this.logger.log(`Player with tgId: ${dto.tgId} now is ${updateAction.template.type} action target`);
        auth.action = updateAction
        return auth
      }

      return auth
    }
  }