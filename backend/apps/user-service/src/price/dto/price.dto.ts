import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePriceDto {
  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  breakfast?: number;

  @ApiProperty({ example: 80, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lunch?: number;

  @ApiProperty({ example: 70, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  dinner?: number;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  custom?: number;
}
