import { ApiProperty } from '@nestjs/swagger'

export class CreateReferralQuestDto {
  @ApiProperty()
  referralCount: number;

  @ApiProperty()
  reward: number;
}

