import { IsDateString, IsInt, IsOptional, Min, IsEnum } from 'class-validator';
import { MealType } from '@prisma/client';

export class BulkUpdateDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;

  @IsOptional()
  @IsInt()
  @Min(1)
  count?: number;

  @IsOptional()
  note?: string;
}

export class BulkDeleteDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;
}
