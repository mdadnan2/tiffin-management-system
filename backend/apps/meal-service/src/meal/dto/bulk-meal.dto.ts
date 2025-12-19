import { IsEnum, IsDateString, IsInt, IsOptional, Min, IsArray, ValidateIf, IsBoolean, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { MealType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class BulkMealDto {
  @ApiProperty({ example: ['2024-01-15', '2024-01-16'], required: false })
  @ValidateIf(o => !o.startDate && !o.endDate)
  @IsArray()
  @IsDateString({}, { each: true })
  dates?: string[];

  @ApiProperty({ example: '2024-01-15', required: false })
  @ValidateIf(o => !o.dates)
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2024-01-19', required: false })
  @ValidateIf(o => !o.dates)
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: [1, 2, 3, 4, 5], description: '0=Sunday, 1=Monday, ..., 6=Saturday', required: false })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  daysOfWeek?: number[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  skipWeekends?: boolean;

  @ApiProperty({ enum: MealType, example: 'LUNCH' })
  @IsEnum(MealType)
  mealType: MealType;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  count: number;

  @ApiProperty({ example: 'Weekly lunch', required: false })
  @IsOptional()
  note?: string;
}
