import { Module } from '@nestjs/common'
import { CryptoService } from './crypto.service'
import { JwtModule } from '@nestjs/jwt'
import { AppConfigModule } from '../config/config.module'
import { AppConfigService } from '../config/config.service'

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
  controllers: [],
  providers: [CryptoService],
  exports: [JwtModule],
})
export class CryptoModule {}