import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DistrictsService } from './districts.service';

@ApiTags('Districts')
@Controller('districts')
export class DistrictsController {
    constructor(private readonly districtsService: DistrictsService) { }

    @Get()
    @ApiOperation({ summary: 'Get list of all districts with statistics' })
    @ApiResponse({ status: 200, description: 'List of districts' })
    async getAllDistricts() {
        return this.districtsService.findAll();
    }

    @Get('overlay')
    @ApiOperation({
        summary: 'Get districts as GeoJSON overlay for map',
        description: 'Returns all districts with geometry and statistics as GeoJSON FeatureCollection',
    })
    @ApiResponse({ status: 200, description: 'GeoJSON FeatureCollection of districts' })
    async getDistrictsOverlay() {
        return this.districtsService.getDistrictsOverlay();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get single district detail with full statistics' })
    @ApiResponse({ status: 200, description: 'District detail with stats' })
    @ApiResponse({ status: 404, description: 'District not found' })
    async getDistrictDetail(@Param('id', ParseIntPipe) id: number) {
        return this.districtsService.getDistrictDetail(id);
    }

    @Get(':id/grid-cells')
    @ApiOperation({ summary: 'Get all grid cells of a district' })
    @ApiResponse({ status: 200, description: 'Grid cells of the district' })
    @ApiResponse({ status: 404, description: 'District not found' })
    async getGridCellsByDistrict(@Param('id', ParseIntPipe) id: number) {
        return this.districtsService.getGridCellsByDistrictId(id);
    }
}
