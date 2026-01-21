import { IsNumber, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchByCoordsDto {
    @ApiProperty({ example: 10.78, description: 'Latitude' })
    @Type(() => Number)
    @IsNumber()
    @Min(-90)
    @Max(90)
    lat: number;

    @ApiProperty({ example: 106.68, description: 'Longitude' })
    @Type(() => Number)
    @IsNumber()
    @Min(-180)
    @Max(180)
    lng: number;
}
