import { IsEnum, IsDateString, IsInt, IsOptional, Min, IsArray } from 'class-validator';
import { MealType } from '@prisma/client';

export class BulkMealDto {
  @IsArray()
  @IsDateString({}, { each: true })
  dates: string[];

  @IsEnum(MealType)
  mealType: MealType;

  @IsInt()
  @Min(1)
  count: number;

  @IsOptional()
  note?: string;
}
