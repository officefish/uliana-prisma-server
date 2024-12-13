import { ApiProperty } from '@nestjs/swagger'

import { IsString, IsOptional, IsBoolean } from 'class-validator';


export class TelegramUserType {
  @ApiProperty({ description: 'User\'s Telegram ID', example: '123456789' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'User\'s first name', example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'User\'s last name', example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ description: 'User\'s username', example: 'johndoe', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: 'User\'s language', example: 'en', required: false })
  @IsOptional()
  @IsString()
  language_code?: string;

  
  @ApiProperty({ description: 'Allows write to pm', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  allows_write_to_pm?: boolean;
//   @ApiProperty({ description: 'Hashed data from Telegram for validation', example: 'abcd1234' })
//   @IsString()
//   hash: string;
}