import { ApiProperty } from '@nestjs/swagger';

export class BuildingFeatureDto {
    @ApiProperty({ example: 'Feature' })
    type: 'Feature';

    @ApiProperty({
        example: { id: 1, grid_cell_id: 100, confidence_score: 0.95, layer: 'buildings' }
    })
    properties: {
        id: number;
        grid_cell_id: number;
        confidence_score: number;
        layer: 'buildings';
    };

    @ApiProperty({
        example: {
            type: 'Polygon',
            coordinates: [[[106.6, 10.75], [106.61, 10.75], [106.61, 10.76], [106.6, 10.76], [106.6, 10.75]]]
        }
    })
    geometry: {
        type: 'Polygon';
        coordinates: number[][][];
    };
}

export class LandUsageFeatureDto {
    @ApiProperty({ example: 'Feature' })
    type: 'Feature';

    @ApiProperty({
        example: {
            id: 1,
            grid_cell_id: 100,
            land_type: 'urban',
            area_m2: 5000,
            layer: 'land_usage',
            color: '#FF5733'
        }
    })
    properties: {
        id: number;
        grid_cell_id: number;
        land_type: string;
        area_m2: number;
        layer: 'land_usage';
        color: string;
    };

    @ApiProperty()
    geometry: {
        type: 'Polygon';
        coordinates: number[][][];
    };
}

export class GridCellFeatureDto {
    @ApiProperty({ example: 'Feature' })
    type: 'Feature';

    @ApiProperty({
        example: {
            id: 100,
            grid_code: 'Q1_001_002',
            district_name: 'Quận 1',
            status: 'PROCESSED',
            density_ratio: 0.65,
            buildings_count: 12,
            layer: 'grid_cells'
        }
    })
    properties: {
        id: number;
        grid_code: string;
        district_name: string;
        status: string;
        density_ratio: number;
        buildings_count: number;
        layer: 'grid_cells';
    };

    @ApiProperty()
    geometry: {
        type: 'Polygon';
        coordinates: number[][][];
    };
}

export class MapOverlayResponseDto {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({
        description: 'Bounding box of the response data',
        example: { minLat: 10.75, minLng: 106.6, maxLat: 10.85, maxLng: 106.75 }
    })
    bounds: {
        minLat: number;
        minLng: number;
        maxLat: number;
        maxLng: number;
    };

    @ApiProperty({ description: 'Grid cells layer - GeoJSON FeatureCollection' })
    grid_cells: {
        type: 'FeatureCollection';
        features: GridCellFeatureDto[];
    };

    @ApiProperty({ description: 'Buildings layer - GeoJSON FeatureCollection' })
    buildings: {
        type: 'FeatureCollection';
        features: BuildingFeatureDto[];
    };

    @ApiProperty({ description: 'Land usage layer - GeoJSON FeatureCollection' })
    land_usages: {
        type: 'FeatureCollection';
        features: LandUsageFeatureDto[];
    };

    @ApiProperty({
        description: 'Statistics summary',
        example: {
            total_grid_cells: 50,
            processed_cells: 45,
            total_buildings: 320,
            avg_density_ratio: 0.58
        }
    })
    stats: {
        total_grid_cells: number;
        processed_cells: number;
        total_buildings: number;
        avg_density_ratio: number;
    };
}

export const LAND_TYPE_COLORS: Record<string, string> = {
    urban: '#E53935',        // Đỏ - Đất đô thị
    agriculture: '#8BC34A',  // Xanh lá - Nông nghiệp
    forest: '#2E7D32',       // Xanh đậm - Rừng
    water: '#1E88E5',        // Xanh dương - Mặt nước
    barren: '#BDBDBD',       // Xám - Đất trống
    rangeland: '#FFA726',    // Cam - Đồng cỏ
    unknown: '#9E9E9E',      // Xám nhạt - Không xác định
};
