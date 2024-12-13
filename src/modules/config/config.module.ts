import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppConfigService } from './config.service'
import { validate } from './env.validation'
@Module({
  imports: [ConfigModule.forRoot({ validate })],
  providers: [AppConfigService],
  exports: [ConfigModule],
})
export class AppConfigModule {}