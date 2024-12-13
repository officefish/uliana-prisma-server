import { Module } from '@nestjs/common'
import { AccessoryService } from '@modules/accessory/accessory.service'
//import { ConfigService } from '@nestjs/config'
import { CryptoService } from '@modules/crypto/crypto.service'
//import { AppConfigService } from '@modules/config/config.service'
import { CryptoModule } from '@modules/crypto/crypto.module'
//import { ConfigModule, ConfigService } from '@nestjs/config'
import { AppConfigModule } from '../config/config.module'
import { AppConfigService } from '../config/config.service'

@Module({
  imports: [CryptoModule, AppConfigModule],
  providers: [AccessoryService, AppConfigService, CryptoService],
})
export class AccessoryModule {}