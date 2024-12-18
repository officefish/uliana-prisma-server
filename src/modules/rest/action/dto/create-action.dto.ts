import { IsString, IsOptional, IsEnum, ValidateNested, IsInt, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ActionType, EffectType, ResourceType } from '@prisma/client';

// DTO для стоимости ресурса
class ResourceCostDto {
  @IsEnum(ResourceType)
  resource: ResourceType;

  @IsInt()
  value: number;

  @IsOptional()
  @IsNumber()
  percentage?: number;
}

// DTO для эффекта ресурса
class ResourceEffectDto {
  @IsEnum(ResourceType)
  resource: ResourceType;

  @IsEnum(EffectType)
  effect: EffectType;

  @IsInt()
  value: number;

  @IsOptional()
  @IsNumber()
  percentage?: number;
}

// DTO для создания действия
export class CreateActionDto {
  @IsEnum(ActionType)
  type: ActionType;

  @IsOptional()
  @ValidateNested()
  @Type(() => ResourceCostDto)
  price?: ResourceCostDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ResourceEffectDto)
  effect?: ResourceEffectDto;
}