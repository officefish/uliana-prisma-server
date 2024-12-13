import { ApiProperty } from '@nestjs/swagger'
import { TaskInstanceDto } from './task.type';

export class TelegramAccountDto {
  @ApiProperty({ description: 'Unique identifier for the Telegram account', example: '642c63b4f6d9f72e8bfda998' })
  id: string;

  @ApiProperty({ description: 'Username of the Telegram account', example: 'john_doe' })
  username: string;

  @ApiProperty({ description: 'Telegram ID', example: '123456789' })
  tgId: string;

  @ApiProperty({ description: 'Date and time when the account was created', example: '2023-05-14T12:00:00Z', nullable: true })
  createdAt: Date | null;

  @ApiProperty({ description: 'Indicates if the user is a premium user', example: true })
  isPremium: boolean;

  @ApiProperty({ description: 'URL of the user\'s profile image', example: 'https://example.com/image.jpg', nullable: true })
  imageUrl?: string;

  @ApiProperty({ description: 'First name of the user', example: 'John', nullable: true })
  firstName?: string;

  @ApiProperty({ description: 'Last name of the user', example: 'Doe', nullable: true })
  lastName?: string;

  @ApiProperty({ description: 'Related Player information', type: () => PlayerDto, nullable: true })
  player?: PlayerDto;
}

export class PlayerDto {
  @ApiProperty({ description: 'Unique identifier for the Player', example: '642c63b4f6d9f72e8bfda999' })
  id: string;

  @ApiProperty({ description: 'Date and time when the player account was created', example: '2023-05-14T12:00:00Z', nullable: true })
  createdAt: Date | null;

  @ApiProperty({ description: 'Indicates if the player is active', example: true })
  active: boolean;

  @ApiProperty({ description: 'Date and time of the player\'s last login', example: '2023-06-01T10:00:00Z', nullable: true })
  lastLogin?: Date;

  @ApiProperty({ description: 'Player token information', type: () => PlayerTokensDto, nullable: true })
  token?: PlayerTokensDto;

  @ApiProperty({ description: 'ID of the player who invited this player', example: '642c63b4f6d9f72e8bfda990', nullable: true })
  invitedById?: string;

  @ApiProperty({ description: 'Player who invited this player', type: () => PlayerDto, nullable: true })
  invitedBy?: PlayerDto;

  @ApiProperty({ description: 'List of players invited by this player', type: () => [PlayerDto] })
  invitations?: PlayerDto[];

  @ApiProperty({ description: 'Referral code used by the player', example: 'REF12345' })
  referralCode: string;

  @ApiProperty({ description: 'Referral code used by the player', example: 'REF12345' })
  referralRewarded: boolean;

  @ApiProperty({ description: 'List of tasks associated with the player', type: () => [TaskInstanceDto] })
  tasks?: TaskInstanceDto[];

  @ApiProperty({ description: 'Date and time associated with a task', example: '2023-06-10T14:00:00Z', nullable: true })
  taskDatetime?: Date;

  @ApiProperty({ description: 'Indicates if the player is marked as unsafe', example: false })
  unsafe: boolean;

  @ApiProperty({ description: 'Telegram account associated with the player', type: () => TelegramAccountDto })
  tgAccount: TelegramAccountDto;

  @ApiProperty({ description: 'ID of the associated Telegram account', example: '642c63b4f6d9f72e8bfda998' })
  tgAccountId: string;
}

export class PlayerTokensDto {
  @ApiProperty({ description: 'Unique identifier for the token', example: '642c63b4f6d9f72e8bfda997' })
  id: string;

  @ApiProperty({ description: 'Access token value', example: 'abc12345' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token value', example: 'xyz67890' })
  refreshToken: string;

  @ApiProperty({ description: 'Token expiry date', example: '2024-01-01T00:00:00Z' })
  expiresAt: Date;
}
