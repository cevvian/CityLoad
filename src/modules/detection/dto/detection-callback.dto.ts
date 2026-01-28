import { IsNumber, IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class BuildingResultDto {
    @ApiProperty({ description: 'GeoJSON Polygon geometry' })
    geom: any;

    @ApiPropertyOptional({ example: 0.85, description: 'Detection confidence score' })
    @IsOptional()
    @IsNumber()
    confidence?: number;

    @ApiPropertyOptional({ example: 'building', description: 'YOLO class name' })
    @IsOptional()
    @IsString()
    class_name?: string;

    @ApiPropertyOptional({ example: 'DETECTION', description: 'Source type' })
    @IsOptional()
    @IsString()
    source_type?: string;
}

class LandUsageResultDto {
    @ApiProperty({ description: 'GeoJSON Polygon geometry' })
    geom: any;

    @ApiPropertyOptional({ example: 'urban_land', description: 'Land usage class: urban_land | agriculture | rangeland | forest | water | barren' })
    @IsOptional()
    @IsString()
    class_name?: string;

    @ApiPropertyOptional({ example: 5000 })
    @IsOptional()
    @IsNumber()
    area_m2?: number;
}

class StatsDto {
    @ApiPropertyOptional({ example: 0.35 })
    @IsOptional()
    @IsNumber()
    density_ratio?: number;

    @ApiPropertyOptional({ example: 1500 })
    @IsOptional()
    @IsNumber()
    building_area_m2?: number;
}

export class DetectionCallbackDto {
    @ApiProperty({ example: 1, description: 'Grid cell ID' })
    @IsNumber()
    grid_cell_id: number;

    @ApiProperty({ example: 'DONE', enum: ['DONE', 'ERROR', 'success', 'error'] })
    @IsString()
    status: 'DONE' | 'ERROR' | 'success' | 'error';

    @ApiPropertyOptional({ type: [BuildingResultDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BuildingResultDto)
    buildings?: BuildingResultDto[];

    @ApiPropertyOptional({ type: [LandUsageResultDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LandUsageResultDto)
    land_usages?: LandUsageResultDto[];

    @ApiPropertyOptional({ type: StatsDto, description: 'Detection statistics' })
    @IsOptional()
    @ValidateNested()
    @Type(() => StatsDto)
    stats?: StatsDto;

    @ApiPropertyOptional({ example: 'Processing failed due to...' })
    @IsOptional()
    @IsString()
    error_message?: string;
}
