import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNumber, IsString, IsUUID } from 'class-validator'

export class TelegramInitDataDto { 

    @ApiProperty({ 
      description: 'User\'s Telegram Init data', 
      example: "'auth_date=<auth_date>\nquery_id=<query_id>\nuser=<user>'." 
    })
    @IsString()
    initData: string;
}

export class TelegramUnsafeInitDataDto { 

  @ApiProperty({ 
    description: 'User tgId', 
    example: 123456789 
  })
  @IsNumber()
  @IsString()
  tgId: number | string;

  @ApiProperty({ 
    description: 'User firstName', 
    example: "Ivan" 
  })
  @IsString()
  firstName: string;

  @ApiProperty({ 
    description: 'User lastName', 
    example: "Ivanov" 
  })
  @IsString()
  lastName: string;

  @ApiProperty({ 
    description: 'Username', 
    example: "Ivanov" 
  })
  @IsString()
  username: string;

  @ApiProperty({ 
    description: 'User has telegram Premium account.', 
    example: false 
  })
  @IsBoolean()
  isPremium: boolean;
  

  /*
 username: userData.username || '',
      isPremium: false,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
  */
}



export class RegisterWithCommandDto extends TelegramInitDataDto { 

  @ApiProperty({ 
    description: 'User\'s Telegram refferal code (uuid)', 
    example: "referrerId=3b241101-e2bb-4255-8caf-4136c566a962" 
  })
  @IsString()
  command: string;
}

export class RegisterWithCommandUnsafeDto extends TelegramUnsafeInitDataDto { 

  @ApiProperty({ 
    description: 'User\'s Telegram refferal code (uuid)', 
    example: "referrerId=3b241101-e2bb-4255-8caf-4136c566a962" 
  })
  @IsString()
  command: string;
}