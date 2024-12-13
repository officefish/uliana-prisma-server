import { ApiProperty } from '@nestjs/swagger';
import { PlayerDto } from './player.type';

export enum TaskType {
    SUBSCRIBE_CHANNEL = 'SUBSCRIBE_CHANNEL',
    INVITE_COUNT = 'INVITE_COUNT',
    INVITE_PREMIUM_COUNT = 'INVITE_PREMIUM_COUNT',
    INVITE_EVERY_DAY = 'INVITE_EVERY_DAY',
    DAILY_BAUNTY = 'DAILY_BAUNTY',
    DAILY_MINIGAME = 'DAILY_MINIGAME',
    TAPS_COUNT = 'TAPS_COUNT',
    DAILY_GAMEPLAY_ACTION = 'DAILY_GAMEPLAY_ACTION',
    DAILY_TON_CHECKIN = 'DAILY_TON_CHECKIN',
    CONNECT_WALLET = 'CONNECT_WALLET',
    MAKE_TEST_TRANSACTION = 'MAKE_TEST_TRANSACTION',
    BYBIT_REGISTRATION = 'BYBIT_REGISTRATION',
    BYBIT_DEPOSIT = 'BYBIT_DEPOSIT',
    BYBIT_KYC = 'BYBIT_KYC',
    OKX_REGISTRATION = 'OKX_REGISTRATION',
    OKX_DEPOSIT = 'OKX_DEPOSIT',
    OKX_KYC = 'OKX_KYC',
    SHARE_STORY = 'SHARE_STORY',
  }
  
  export enum TaskStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    READY = 'READY',
    COMPLETED = 'COMPLETED',
  }
  

export class TaskDto {
  @ApiProperty({ description: 'Unique identifier for the task', example: '642c63b4f6d9f72e8bfda991' })
  id: string;

  @ApiProperty({ description: 'Title of the task', example: 'Subscribe to the channel' })
  title: string;

  @ApiProperty({ description: 'Description of the task', example: 'Subscribe to the Telegram channel to earn points', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Type of the task', enum: TaskType })
  type: TaskType;

  @ApiProperty({ description: 'Baunty points for completing the task', example: 50, nullable: true })
  baunty?: number;

  @ApiProperty({ description: 'Bonus points for completing the task', example: 10, nullable: true })
  bonus?: number;

  @ApiProperty({ description: 'Target value for the task, e.g., number of actions required', example: 5, nullable: true })
  target?: number;

  @ApiProperty({ description: 'Content or details of the task', example: 'Follow the link and subscribe to the channel', nullable: true })
  content?: string;

  @ApiProperty({ description: 'Navigation URL or reference for the task', example: 'https://example.com/task-details', nullable: true })
  navigate?: string;

  @ApiProperty({ description: 'Expiration date and time for the task', example: '2024-01-01T00:00:00Z', nullable: true })
  expiresAt?: Date;

  @ApiProperty({ description: 'Date and time when the task was created', example: '2023-06-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Date and time when the task was last updated', example: '2023-06-10T00:00:00Z' })
  updatedAt: Date;

  @ApiProperty({ description: 'Indicates if the task is a daily task', example: true })
  isDaily: boolean;

  @ApiProperty({ description: 'List of player task instances associated with this task', type: () => [TaskInstanceDto] })
  playerTasks: TaskInstanceDto[];
}

export class TaskInstanceDto {
  @ApiProperty({ description: 'Unique identifier for the task instance', example: '642c63b4f6d9f72e8bfda992' })
  id: string;

  @ApiProperty({ description: 'Template task details', type: () => TaskDto, nullable: true })
  templateTask?: TaskDto;

  @ApiProperty({ description: 'ID of the template task', example: '642c63b4f6d9f72e8bfda991', nullable: true })
  templateTaskId?: string;

  @ApiProperty({ description: 'Player associated with the task instance', type: () => PlayerDto, nullable: true })
  player?: PlayerDto;

  @ApiProperty({ description: 'ID of the player', example: '642c63b4f6d9f72e8bfda993', nullable: true })
  playerId?: string;

  @ApiProperty({ description: 'Status of the task instance', enum: TaskStatus, example: TaskStatus.PENDING })
  status: TaskStatus;

  @ApiProperty({ description: 'Progress made on the task instance', example: 3 })
  progress: number;

  @ApiProperty({ description: 'Date and time when the task instance was created', example: '2023-06-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Date and time when the task instance was last updated', example: '2023-06-10T00:00:00Z' })
  updatedAt: Date;

  @ApiProperty({ description: 'Date and time when the task instance was finished', example: '2023-06-15T00:00:00Z', nullable: true })
  finishedAt?: Date;
}

