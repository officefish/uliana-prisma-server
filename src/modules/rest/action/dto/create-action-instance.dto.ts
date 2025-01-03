import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateActionInstanceDto {
  @IsString()
  playerId: string;

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsString()
  templateId: string;

  @IsUUID()
  uuid: string;

  @IsOptional()  
  @IsString()
  key: string;
}