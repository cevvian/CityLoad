import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MapsService } from './maps.service';
import { GetGridCellsDto, DetectRequestDto, MapOverlayResponseDto } from './dto';

@ApiTags('Maps')
@Controller('maps')
export class MapsController {
    constructor(private readonly mapsService: MapsService) { }

    @Get('overlay')
    @ApiOperation({
        summary: 'Get overlay layers by bounding box (GeoJSON format)',
        description: 'Returns grid cells, buildings, and land usage as GeoJSON FeatureCollections ready for Mapbox overlay'
    })
    @ApiResponse({ status: 200, description: 'GeoJSON overlay data', type: MapOverlayResponseDto })
    async getOverlay(@Query() query: GetGridCellsDto) {
        return this.mapsService.getOverlayByBounds(query);
    }

    @Get('grid-cells')
    @ApiOperation({ summary: 'Get grid cells by bounding box (legacy)' })
    @ApiResponse({ status: 200, description: 'Returns grid cells within bounds' })
    async getGridCells(@Query() query: GetGridCellsDto) {
        return this.mapsService.getGridCellsByBounds(query);
    }

    @Post('detect')
    @ApiOperation({ summary: 'Request AI detection for a grid cell (realtime)' })
    @ApiResponse({ status: 200, description: 'Detection result' })
    @ApiResponse({ status: 202, description: 'Detection in progress' })
    async detectObjects(@Body() body: DetectRequestDto) {
        return this.mapsService.detectObjects(body);
    }
}

