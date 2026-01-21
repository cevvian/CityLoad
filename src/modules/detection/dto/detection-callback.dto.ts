import { IsNumber, IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class BuildingResultDto {
    @ApiProperty()
    geom: any;

    @ApiProperty({ example: 0.95 })
    @IsNumber()
    confidence_score: number;
}

class LandUsageResultDto {
    @ApiProperty()
    geom: any;

    @ApiProperty({ example: 'residential' })
    @IsString()
    land_type: string;

    @ApiProperty({ example: 5000 })
    @IsNumber()
    area_m2: number;
}

export class DetectionCallbackDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    grid_cell_id: number;

    @ApiProperty({ example: 'success', enum: ['success', 'error'] })
    @IsString()
    status: 'success' | 'error';

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

    @ApiPropertyOptional({ example: 'Processing failed due to...' })
    @IsOptional()
    @IsString()
    error_message?: string;
}
