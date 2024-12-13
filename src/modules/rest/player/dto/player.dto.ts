// create-player.dto.ts
import { Injectable } from '@nestjs/common';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateTelegramAccountDto {
  @IsString()
  username: string;

  @IsString()
  tgId: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;
}

export class CreatePlayerDto {
      
  @IsOptional()
  @IsString()
  referralCode?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  tgAccount: CreateTelegramAccountDto;
}

