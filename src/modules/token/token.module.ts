import { Module } from '@nestjs/common'
import { TokenService } from './token.service'
import { AppConfigModule } from '../config/config.module'
import { AppConfigService } from '../config/config.service'
import { JwtModule } from '@nestjs/jwt'

@Module({
    imports: [
        AppConfigModule,
        JwtModule.registerAsync({
          imports: [AppConfigModule],
          useFactory: async (configService: AppConfigService) => ({
            secret: configService.getJwtSignature(),
          }),
          extraProviders: [AppConfigService],
          inject: [AppConfigService],
        }),
      ],
  providers: [TokenService, AppConfigService],
  exports: [TokenService],
})
export class TokenModule {}