import { IsEnum, IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { MealType } from '@prisma/client';

export class CreateMealDto {
  @IsDateString()
  date: string;

  @IsEnum(MealType)
  mealType: MealType;

  @IsInt()
  @Min(1)
  count: number;

  @IsOptional()
  note?: string;
}

export class UpdateMealDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  count?: number;

  @IsOptional()
  note?: string;
}
