import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetGridCellsDto {
    @ApiProperty({ example: 10.75, description: 'Southwest latitude' })
    @Type(() => Number)
    @IsNumber()
    @Min(-90)
    @Max(90)
    minLat: number;

    @ApiProperty({ example: 106.6, description: 'Southwest longitude' })
    @Type(() => Number)
    @IsNumber()
    @Min(-180)
    @Max(180)
    minLng: number;

    @ApiProperty({ example: 10.85, description: 'Northeast latitude' })
    @Type(() => Number)
    @IsNumber()
    @Min(-90)
    @Max(90)
    maxLat: number;

    @ApiProperty({ example: 106.75, description: 'Northeast longitude' })
    @Type(() => Number)
    @IsNumber()
    @Min(-180)
    @Max(180)
    maxLng: number;

    @ApiPropertyOptional({ example: 15, description: 'Current zoom level' })
    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    zoom?: number;
}
