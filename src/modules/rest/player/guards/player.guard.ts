import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    Logger,
    NotFoundException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { PrismaService } from '@modules/prisma/prisma.service'
  import { IS_PUBLIC_KEY } from '@/common/decorators'
  import { IS_PLAYER_KEY } from '@/common/decorators'
  import { TokenService } from '@modules/token/token.service'
  
  
  @Injectable()
  export class PlayerGuard implements CanActivate {
    private readonly logger = new Logger(PlayerGuard.name);
  
    constructor(
      private tokenService: TokenService,
      private reflector: Reflector,
      private prismaService: PrismaService,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const req = context.switchToHttp().getRequest();
  
      const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
  
      const isPlayer = this.reflector.getAllAndOverride(IS_PLAYER_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
  
      if (isPublic) return true;
  
      /* TODO: Нестрогая проверка токенов через cookies */
      if (await this.hasValidTookenInCookies(req, isPlayer)) {
        this.logger.log("For some reason validation of cookies passed");
        //return false;
      }
  
      /* Строгая проверка токенов через headers */  
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        const msg = 'Authorization header is missing or malformed';
        this.logger.error(new Error(msg));
        throw new UnauthorizedException(msg);
      }
  
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];
  
      if (bearer !== 'Bearer' || !token) {
        const errorMessage = 'Invalid authorization header. Bearer or token not specified';
        this.logger.error(new Error(errorMessage));
        this.logger.error(new Error('Wrong Auth Header: ' + JSON.stringify(authHeader)));
        throw new UnauthorizedException(errorMessage);
      }
  
      if (isPlayer) {
        const userToken = this.tokenService.validateAccessToken(token);
  
        const player = await this.prismaService.player.findUnique({
          where: { id: userToken.id },
        });
  
        if (!player) {
          const msg = `Player with id: ${userToken.id} not found.`;
          this.logger.error(new Error(msg));
          throw new NotFoundException(msg);
        }
  
        req.currentUser = userToken;
        return true;
      }
  
      return true;
    }
  
    async hasValidTookenInCookies(req: Request, isPlayer: boolean): Promise<boolean> {
      return false;
    }  
  }