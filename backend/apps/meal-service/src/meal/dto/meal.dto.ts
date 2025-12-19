import { IsEnum, IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { MealType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMealDto {
  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: MealType, example: 'LUNCH' })
  @IsEnum(MealType)
  mealType: MealType;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  count: number;

  @ApiProperty({ example: 'Extra spicy', required: false })
  @IsOptional()
  note?: string;
}

export class UpdateMealDto {
  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  count?: number;

  @ApiProperty({ example: 'Updated note', required: false })
  @IsOptional()
  note?: string;
}
