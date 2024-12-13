import { ApiProperty } from '@nestjs/swagger'

export class UpdateReferralQuestDto {
  @ApiProperty()
  referralCount?: number;

  @ApiProperty()
  reward?: number;
}