import { ApiProperty } from '@nestjs/swagger'
import {
  IsEnum,
  IsInt,
  IsOptional,
  Min,
  IsString,
  IsIn,
} from 'class-validator'
import { Type } from 'class-transformer'
import { OrderType } from '../constants/order-enum'

export class PageOptionsDto {
  @ApiProperty({
    enum: OrderType,
    default: OrderType.asc,
    description: 'Sorting order (ASC or DESC)',
    required: false,
  })
  @IsEnum(OrderType)
  @IsOptional()
  @Type(() => String)
  readonly order?: OrderType;

  @ApiProperty({
    type: Number,
    minimum: 1,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  readonly page?: number;

  @ApiProperty({
    type: Number,
    minimum: 1,
    enum: [5, 10, 12, 20, 50],
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsIn([5, 10, 20, 50])
  @IsOptional()
  @Type(() => Number)
  readonly take?: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly q?: string;
}