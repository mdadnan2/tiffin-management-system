import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MonthlyDashboardDto {
  @ApiProperty({ example: '2024-01', description: 'Month in YYYY-MM format', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month must be in YYYY-MM format' })
  month?: string;
}

export class WeeklyDashboardDto {
  @ApiProperty({ example: '2024-W03', description: 'Week in YYYY-Www format', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-W\d{2}$/, { message: 'week must be in YYYY-Www format' })
  week?: string;
}
