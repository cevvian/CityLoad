import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MapsService } from './maps.service';
import { GetGridCellsDto, DetectRequestDto } from './dto';

@ApiTags('Maps')
@Controller('maps')
export class MapsController {
    constructor(private readonly mapsService: MapsService) { }

    @Get('grid-cells')
    @ApiOperation({ summary: 'Get grid cells by bounding box' })
    @ApiResponse({ status: 200, description: 'Returns grid cells within bounds' })
    async getGridCells(@Query() query: GetGridCellsDto) {
        return this.mapsService.getGridCellsByBounds(query);
    }

    @Post('detect')
    @ApiOperation({ summary: 'Request AI detection for a grid cell' })
    @ApiResponse({ status: 200, description: 'Detection result' })
    @ApiResponse({ status: 202, description: 'Detection in progress' })
    async detectObjects(@Body() body: DetectRequestDto) {
        return this.mapsService.detectObjects(body);
    }
}
