import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePriceDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  breakfast?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lunch?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dinner?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  custom?: number;
}
