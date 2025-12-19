import { IsDateString, IsInt, IsOptional, Min, IsEnum } from 'class-validator';
import { MealType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class BulkUpdateDto {
  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-01-19' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ enum: MealType, example: 'LUNCH', required: false })
  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  count?: number;

  @ApiProperty({ example: 'Updated for the week', required: false })
  @IsOptional()
  note?: string;
}

export class BulkDeleteDto {
  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-01-19' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ enum: MealType, example: 'LUNCH', required: false })
  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;
}
