import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FetchTasksQueryDto {
    @ApiPropertyOptional({
        example: 5,
        description: 'Number of tasks to fetch (max 20)',
        default: 5,
    })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(20)
    limit?: number = 5;

    @ApiPropertyOptional({
        example: 'Quận 1',
        description: 'Filter by district name - only return tasks for this district',
    })
    @IsOptional()
    @IsString()
    district_name?: string;
}

export class TaskItemDto {
    @ApiProperty({ example: 101, description: 'Grid cell ID - AI needs this to submit results' })
    id: number;

    @ApiProperty({ example: 'HCM-101', description: 'Grid code for logging/display' })
    grid_code: string;

    @ApiProperty({ example: 'Quận 1', description: 'District name of the grid cell', required: false })
    district_name: string;

    @ApiProperty({
        example: [106.6912, 10.7755, 106.6921, 10.7764],
        description: 'Bounding box [min_lon, min_lat, max_lon, max_lat] for tile calculation',
    })
    bbox: [number, number, number, number];

    @ApiProperty({
        description: 'GeoJSON Polygon geometry for precise masking',
        example: {
            type: 'Polygon',
            coordinates: [
                [
                    [106.6912, 10.7755],
                    [106.6921, 10.7755],
                    [106.6921, 10.7764],
                    [106.6912, 10.7764],
                    [106.6912, 10.7755],
                ],
            ],
        },
    })
    geom: {
        type: 'Polygon';
        coordinates: number[][][];
    };
}

export class FetchTasksResponseDto {
    @ApiProperty({ type: [TaskItemDto] })
    tasks: TaskItemDto[];

    @ApiProperty({ example: 5, description: 'Number of tasks returned' })
    count: number;

    @ApiProperty({ example: 'Quận 1', description: 'District filter applied (null if not filtered)', required: false })
    district_filter: string | null;

    @ApiProperty({ example: '2026-01-23T10:30:00.000Z', description: 'Fetch timestamp' })
    fetched_at: string;
}
