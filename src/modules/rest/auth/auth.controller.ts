import { 
    Body, 
    Controller, 
    ForbiddenException, 
    Logger, 
    Options, 
    Post, 
    Res
  } from '@nestjs/common'
  import { ApiResponse, ApiTags } from '@nestjs/swagger'
  import { FastifyReply } from 'fastify'
  
  import { Public } from '@/common/decorators/is-public.decorator'

  
  import { AuthService } from './auth.service'
  
  //import { PlayerLoginResponse } from './responses'
  
  import { RegisterWithCommandDto, RegisterWithCommandUnsafeDto, TelegramInitDataDto, TelegramUnsafeInitDataDto } from './dto/telegram-initial.dto'
  import { TelegramService } from '@modules/telegram/telegram.service'
  import { ReferralsService } from '../referrals/referrals.service'
  
  @ApiTags('auth')
  @Public()
  @Controller('auth')
  export class AuthController {
    private logger = new Logger(AuthController.name);
    constructor(
      private readonly authService: AuthService,
      private readonly telegramService: TelegramService,
      private readonly referralService: ReferralsService,
    ) {}
  
    @ApiResponse({
      status: 200,
      description: 'User successfully registered or logged in',
      //type: PlayerLoginResponse,
    })
    @ApiResponse({
      status: 403,
      description: 'Invalid Telegram Init Data',
    })
  
    @Post('register')
    async register(
      @Body() initial: TelegramInitDataDto,
    ) {
  
      this.logger.log('Player with initData trying to register or login.');
      this.logger.log(`initData: ${initial.initData}`)
  
      const valid = this.telegramService.validateInitData(initial.initData);
      if (!valid) {
        // Возвращаем 403 ошибку если данные невалидные
        const msg = 'Invalid initData'
        this.logger.error(new Error(msg));
        throw new ForbiddenException(msg);
      }
  
      const userData = this.telegramService.extractUserData(initial.initData);
  
      const dto = {
        tgId: userData.id,
        username: userData.username || '',
        isPremium: false,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
      } as unknown as TelegramUnsafeInitDataDto
  
      const auth = await this.authService.registerOrLogin(dto, false);
      if (auth) {
        this.logger.log(`Player with tgId: ${userData.id} successfully registered or logged in.`);
        this.logger.log(`Player data: ${JSON.stringify(auth)}`)  
      }
      return auth
    }
  
    @Post('register/unsafe')
    async registerUnsafe(
      @Body() userData: TelegramUnsafeInitDataDto,
    ) {
      this.logger.log(`Player with tgId: ${userData.tgId} trying to register or login.`);
  
      const dto = {
        tgId: String(userData.tgId),
        username: userData.username || '',
        isPremium: userData.isPremium || false,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
      } as unknown as TelegramUnsafeInitDataDto
  
      const auth = await this.authService.registerOrLogin(dto, true);
      if (auth) {
        this.logger.log(`Player with tgId: ${userData.tgId} successfully registered or login.`);
        this.logger.log(`Player data: ${JSON.stringify(auth)}`)
      }
      return auth
    }
  
    /* register with referrer */
    @ApiResponse({
      status: 200,
      description: 'User successfully registered or logged in',
      //type: PlayerLoginResponse,
    })
    @ApiResponse({
      status: 403,
      description: 'Invalid Telegram Init Data',
    })
  
    @Post('register-with-command')
    async registerWithReferrer(
      @Body() body: RegisterWithCommandDto,
    ) {
  
      const { initData, command } = body
  
      this.logger.log('Player with initData trying to register or login.');
      this.logger.log(`initData: ${initData}`)
  
      const valid = this.telegramService.validateInitData(initData);
      if (!valid) {
        // Возвращаем 403 ошибку если данные невалидные
        const msg = 'Invalid initData'
        this.logger.error(new Error(msg));
        throw new ForbiddenException(msg);
      }
  
      const userData = this.telegramService.extractUserData(initData);
  
      const dto = {
        tgId: userData.id,
        username: userData.username || '',
        isPremium: false,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
      } as unknown as TelegramUnsafeInitDataDto
  
       //const referralCode = command.split('=')[1]
      if (!command.startsWith("referrerId=")) {
        const auth = await this.authService.registerOrLogin(dto, false);
        if (auth) {
          this.logger.log(`Player with tgId: ${userData.id} successfully registered or login. But no reference to the referrer found.`);
          this.logger.log(`Player data: ${JSON.stringify(auth)}`)
        } 
        return auth
      }
  
      const parsedCommand = this.authService.parseReferrerIdString(command)
      const referralCode = parsedCommand?.uuid || null
  
      const response = await this.authService.registerOrLogin(dto, false);
  
      /* Если пользователь пытается зарегистрировать сам себя, то игнорируем эту попытку */
      if (response.player.referralCode === referralCode) {
        this.logger.warn(`Player with tgId: ${userData.id} triing refer himself.`);
        this.logger.log(`Player data: ${JSON.stringify(response)}`)
        return response
      }
  
      /* Если пользователь уже зарегистрирова, то игнорируем попытку активации приглашения */
      if (!response.isNew) {
        this.logger.warn(`Player with tgId: ${userData.id} not new user.`);
        this.logger.log(`Player data: ${JSON.stringify(response)}`)
        return response
      }
  
      const referrer = await this.referralService.findByReferralCode(referralCode);
        if (referrer) {
          await this.referralService.trackReferral(referrer.id, response.player.id);
          await this.referralService.rewardReferrer(referrer.id);
          let invitedBy = await this.authService.initReferrer(referralCode);
          const playerWithReferrer = await this.authService.updateReferrer(response.player.id, invitedBy)
          response.player = playerWithReferrer
          this.logger.log(`Player with tgId: ${userData.id} now is refferal for user with tgId: ${referrer.tgAccount.tgId}.`);
        }
  
      this.logger.log(`Player data: ${JSON.stringify(response)}`)
      return response
    }
  
    @Post('register-with-command/unsafe')
    async registerWithReferrerUnsafe(
      @Body() body: RegisterWithCommandUnsafeDto,
    ) {
  
      const { command } = body
      this.logger.log(`Player with tgId: ${body.tgId} trying to register or login.`);
  
      const dto = {
        tgId: String(body.tgId),
        username: body.username || '',
        isPremium: body.isPremium || false,
        firstName: body.firstName || '',
        lastName: body.lastName || '',
      } as unknown as TelegramUnsafeInitDataDto
  
      if (!command || !command.startsWith("referrerId=")) {
        const auth = await this.authService.registerOrLogin(dto, true);
        if (auth) {
          this.logger.log(`Player with tgId: ${body.tgId} successfully registered or login. But no reference to the referrer found.`);
        }
        this.logger.log(`Player data: ${JSON.stringify(auth)}`)
        return auth
      }
  
      const parsedCommand = this.authService.parseReferrerIdString(command)
      const referralCode = parsedCommand?.uuid || null
      const response = await this.authService.registerOrLogin(
        dto, 
        true);
  
      /* Если пользователь пытается зарегистрировать сам себя, то игнорируем эту попытку */
      if (response.player.referralCode === referralCode) {
        this.logger.warn(`Player with tgId: ${body.tgId} triing refer himself.`);
        this.logger.log(`Player data: ${JSON.stringify(response)}`)
        return response
      }
  
      /* Если пользователь уже зарегистрирова, то игнорируем попытку активации приглашения */
      if (!response.isNew) {
        this.logger.warn(`Player with tgId: ${body.tgId} not new user.`);
        this.logger.log(`Player data: ${JSON.stringify(response)}`)
        return response
      }
  
      const referrer = await this.referralService.findByReferralCode(referralCode);
        if (referrer) {
          await this.referralService.trackReferral(referrer.id, response.player.id);
          await this.referralService.rewardReferrer(referrer.id);
          let invitedBy = await this.authService.initReferrer(referralCode);
          const playerWithReferrer = await this.authService.updateReferrer(response.player.id, invitedBy)
          response.player = playerWithReferrer
          this.logger.log(`Player with tgId: ${body.tgId} now is refferal for user with tgId: ${referrer.tgAccount.tgId}.`);
        }
      this.logger.log(`Player data: ${JSON.stringify(response)}`)
      return response  
    }
  
    @Options('register')
    @ApiResponse({
      status: 204,
      description: 'CORS preflight check for register endpoint',
    })
    async options(@Res() reply: FastifyReply) {
      return reply.status(204).send(); // Возвращаем успешный ответ для preflight
    }
  }