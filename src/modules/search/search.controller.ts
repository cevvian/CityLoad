import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchByCoordsDto, SearchByAddressDto } from './dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Get('by-coords')
    @ApiOperation({ summary: 'Find grid cell by coordinates' })
    @ApiResponse({ status: 200, description: 'Grid cell found' })
    @ApiResponse({ status: 404, description: 'No grid cell at this location' })
    async searchByCoords(@Query() query: SearchByCoordsDto) {
        return this.searchService.findByCoords(query.lat, query.lng);
    }

    @Get('by-address')
    @ApiOperation({ summary: 'Search by address (geocoding)' })
    @ApiResponse({ status: 200, description: 'Search results' })
    async searchByAddress(@Query() query: SearchByAddressDto) {
        return this.searchService.findByAddress(query.q, query.limit);
    }

    @Get('districts')
    @ApiOperation({ summary: 'Get list of all districts' })
    @ApiResponse({ status: 200, description: 'List of districts' })
    async getDistricts() {
        return this.searchService.getAllDistricts();
    }
}
