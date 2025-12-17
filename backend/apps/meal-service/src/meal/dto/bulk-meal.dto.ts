import { IsEnum, IsDateString, IsInt, IsOptional, Min, IsArray, ValidateIf, IsBoolean, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { MealType } from '@prisma/client';

export class BulkMealDto {
  @ValidateIf(o => !o.startDate && !o.endDate)
  @IsArray()
  @IsDateString({}, { each: true })
  dates?: string[];

  @ValidateIf(o => !o.dates)
  @IsDateString()
  startDate?: string;

  @ValidateIf(o => !o.dates)
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday

  @IsOptional()
  @IsBoolean()
  skipWeekends?: boolean;

  @IsEnum(MealType)
  mealType: MealType;

  @IsInt()
  @Min(1)
  count: number;

  @IsOptional()
  note?: string;
}
