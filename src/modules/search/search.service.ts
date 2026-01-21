import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GridCell } from '../../database/entities/grid-cell.entity';
import { District } from '../../database/entities/district.entity';

@Injectable()
export class SearchService {
    constructor(
        @InjectRepository(GridCell)
        private gridCellRepo: Repository<GridCell>,
        @InjectRepository(District)
        private districtRepo: Repository<District>,
        private httpService: HttpService,
    ) { }

    /**
     * Find grid cell containing the given coordinates
     */
    async findByCoords(lat: number, lng: number) {
        const gridCell = await this.gridCellRepo
            .createQueryBuilder('gc')
            .leftJoinAndSelect('gc.buildings', 'buildings')
            .leftJoinAndSelect('gc.landUsages', 'landUsages')
            .where(`ST_Contains(gc.geom, ST_SetSRID(ST_Point(:lng, :lat), 4326))`, { lat, lng })
            .getOne();

        if (!gridCell) {
            throw new HttpException('No grid cell found at this location', HttpStatus.NOT_FOUND);
        }

        return {
            grid_cell: gridCell,
            coordinates: { lat, lng },
        };
    }

    /**
     * Search by address using Nominatim geocoding
     */
    async findByAddress(query: string, limit = 5) {
        try {
            // Use OpenStreetMap Nominatim for geocoding (free)
            const response = await firstValueFrom(
                this.httpService.get('https://nominatim.openstreetmap.org/search', {
                    params: {
                        q: `${query}, Ho Chi Minh City, Vietnam`,
                        format: 'json',
                        limit,
                        addressdetails: 1,
                    },
                    headers: {
                        'User-Agent': 'CityLoad/1.0',
                    },
                }),
            );

            const results = response.data;

            if (!results || results.length === 0) {
                return { results: [], message: 'No results found' };
            }

            // For each result, try to find corresponding grid cell
            const enrichedResults = await Promise.all(
                results.map(async (r: any) => {
                    const lat = parseFloat(r.lat);
                    const lng = parseFloat(r.lon);

                    // Find grid cell at this location
                    const gridCell = await this.gridCellRepo
                        .createQueryBuilder('gc')
                        .where(`ST_Contains(gc.geom, ST_SetSRID(ST_Point(:lng, :lat), 4326))`, { lat, lng })
                        .getOne();

                    return {
                        display_name: r.display_name,
                        lat,
                        lng,
                        type: r.type,
                        grid_cell: gridCell ? { id: gridCell.id, grid_code: gridCell.grid_code } : null,
                    };
                }),
            );

            return { results: enrichedResults };
        } catch (error) {
            console.error('Geocoding error:', error.message);
            throw new HttpException('Geocoding service error', HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    /**
     * Get all districts
     */
    async getAllDistricts() {
        const districts = await this.districtRepo.find({
            select: ['id', 'name'],
        });

        // Get grid cell count per district
        const gridCellCounts = await this.gridCellRepo
            .createQueryBuilder('gc')
            .select('gc.district_name', 'district_name')
            .addSelect('COUNT(*)', 'count')
            .groupBy('gc.district_name')
            .getRawMany();

        const countMap = new Map(gridCellCounts.map((c) => [c.district_name, parseInt(c.count)]));

        return districts.map((d) => ({
            id: d.id,
            name: d.name,
            grid_cells_count: countMap.get(d.name) || 0,
        }));
    }
}
