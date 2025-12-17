import { IsOptional, IsString, Matches } from 'class-validator';

export class CalendarQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month must be in YYYY-MM format' })
  month?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-W\d{2}$/, { message: 'week must be in YYYY-Www format' })
  week?: string;
}
