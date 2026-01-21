import { IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class BoundsDto {
    @ApiProperty({ example: 10.75 })
    @IsNumber()
    minLat: number;

    @ApiProperty({ example: 106.6 })
    @IsNumber()
    minLng: number;

    @ApiProperty({ example: 10.85 })
    @IsNumber()
    maxLat: number;

    @ApiProperty({ example: 106.75 })
    @IsNumber()
    maxLng: number;
}

export class DetectRequestDto {
    @ApiProperty({ example: 1, description: 'Grid cell ID to detect' })
    @IsNumber()
    grid_cell_id: number;

    @ApiPropertyOptional({ description: 'Satellite image URL' })
    @IsOptional()
    @IsString()
    image_url?: string;

    @ApiProperty({ type: BoundsDto })
    @ValidateNested()
    @Type(() => BoundsDto)
    bounds: BoundsDto;
}
