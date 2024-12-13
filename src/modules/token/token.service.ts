import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
    Logger,
    BadRequestException,
  } from '@nestjs/common'
  //import * as jwt from 'jsonwebtoken'
  import { JwtService } from '@nestjs/jwt'
  import { PlayerTokenDTO } from './dto'

  import { PrismaService } from '@modules/prisma/prisma.service'
  //import { ConfigService } from '@nestjs/config'
  import { AppConfigService } from '@modules/config/config.service' //AppConfigService
  
  @Injectable()
  export class TokenService {
    private readonly logger = new Logger(TokenService.name)
  
    constructor(
      private prisma: PrismaService,
      private config: AppConfigService,
      private jwt: JwtService
    ) {}
  
    generateTokens(payload: PlayerTokenDTO) {
      const accessToken = this.jwt.sign(
        payload,
        {
          expiresIn: this.config.getJwtAccessExpiresIn(),
        },
      );
      const refreshToken = this.jwt.sign(
        payload,
        {
          expiresIn: this.config.getJwtRefreshExpiresIn(),
        },
      );
  
      this.logger.log(`Generated tokens for player with tgId ${payload.tgId}`);
  
      return {
        accessToken,
        refreshToken,
      };
    }
  
    async saveTokens(payload: PlayerTokenDTO, refreshToken: string) {
      const user = await this.prisma.playerTokens.findFirst({
        where: { playerId: payload.id },
      });
  
      if (user) {
        this.logger.log(`Updating refresh token for player with ID ${payload.tgId}`);
        const updateExistingToken = await this.prisma.playerTokens.update({
          where: { playerId: payload.id },
          data: { refreshToken },
        });
        return updateExistingToken;
      }
  
      this.logger.log(`Saving refresh token for player with tgId ${payload.tgId}`);
      const token = this.prisma.playerTokens.create({
        data: { refreshToken: refreshToken, playerId: payload.id },
      });
      return token;
    }
  
    validateAccessToken(accessToken: string) {
      
      try {
        const payload = this.jwt.verify(
          accessToken,
        );
  
        this.logger.log(`Validated access token for user with tgId: ${payload.tgId}`);
        return payload as PlayerTokenDTO;

      } catch (err: any) {
        const msg = `Failed to validate access token: ${err.message}`
        this.logger.error(new Error(msg));
        this.logger.warn(`wrong access token: ${accessToken}`);
        throw new UnauthorizedException(msg);
      } 
    }
  
    validateRefreshToken(refreshToken: string) {
      try {
        const token = this.jwt.verify(
          refreshToken,
          //this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        );
  
        this.logger.log(`Validated refresh token`);
  
        return token as PlayerTokenDTO;
      } catch (err: any) {
        const msg = `Failed to validate refresh token: ${err.message}`
        this.logger.error(new Error(msg));
        this.logger.warn(`wrong refresh token: ${refreshToken}`);
        throw new UnauthorizedException(msg);
      }
    }
  
    async deleteToken(refreshToken: string) {
      const token = await this.findToken(refreshToken);
  
      if (!token) {
        const msg = `Failed to delete token: ${refreshToken}.`;
        this.logger.error(new Error(msg));
        throw new BadRequestException(msg);
      }
  
      this.logger.log(`Deleting refresh token`);
      await this.prisma.playerTokens.delete({
        where: { id: token.id },
      });
      return { message: 'Token deleted successfully.' };
    }
  
    async findToken(refreshToken: string) {
      try {
        const token = await this.prisma.playerTokens.findFirst({
          where: { refreshToken: refreshToken },
        });
        return token;
      } catch (err: any) {
        this.logger.error(`Failed to find token: ${err.message}`);
        throw new UnauthorizedException(
          'Token not found! Please register first!',
        );
      }
    }
  
    generateResetToken(payload: PlayerTokenDTO) {
      const resetToken = this.jwt.sign(
        payload,
        //this.configService.getOrThrow<string>('JWT_RESET_SECRET'),
        {
          expiresIn: this.config.getJwtResetTime(),
        },
      );
  
      this.logger.log(`Generated reset token for user with ID ${payload.id}`);
  
      return resetToken;
    }
  
    async validateResetToken(resetToken: string) {
      try {
        const token = this.jwt.verify(
          resetToken,
          //this.configService.getOrThrow<string>('JWT_RESET_SECRET'),
        );
  
        this.logger.log(`Validated reset token`);
  
        return token as PlayerTokenDTO;
      } catch (err: any) {
        this.logger.error(`Failed to validate reset token: ${err.message}`);
        throw new UnauthorizedException('Invalid token!');
      }
    }
  }