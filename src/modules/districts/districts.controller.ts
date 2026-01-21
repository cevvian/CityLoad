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

    @Get(':id/grid-cells')
    @ApiOperation({ summary: 'Get all grid cells of a district' })
    @ApiResponse({ status: 200, description: 'Grid cells of the district' })
    @ApiResponse({ status: 404, description: 'District not found' })
    async getGridCellsByDistrict(@Param('id', ParseIntPipe) id: number) {
        return this.districtsService.getGridCellsByDistrictId(id);
    }
}
