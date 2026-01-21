import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { District } from '../../database/entities/district.entity';
import { GridCell } from '../../database/entities/grid-cell.entity';
import { GridCellStatus } from '../../database/entities/enums/grid-cell-status.enum';

@Injectable()
export class DistrictsService {
    constructor(
        @InjectRepository(District)
        private districtRepo: Repository<District>,
        @InjectRepository(GridCell)
        private gridCellRepo: Repository<GridCell>,
    ) { }

    /**
     * Get all districts with grid cell statistics
     */
    async findAll() {
        const districts = await this.districtRepo.find({
            select: ['id', 'name'],
        });

        // Get grid cell counts grouped by district
        const gridCellStats = await this.gridCellRepo
            .createQueryBuilder('gc')
            .select('gc.district_name', 'district_name')
            .addSelect('COUNT(*)', 'total_count')
            .addSelect(`SUM(CASE WHEN gc.status = '${GridCellStatus.PROCESSED}' THEN 1 ELSE 0 END)`, 'processed_count')
            .groupBy('gc.district_name')
            .getRawMany();

        const statsMap = new Map(gridCellStats.map((s) => [s.district_name, s]));

        // Get building counts grouped by district
        const buildingStats = await this.gridCellRepo
            .createQueryBuilder('gc')
            .leftJoin('gc.buildings', 'b')
            .select('gc.district_name', 'district_name')
            .addSelect('COUNT(b.id)', 'buildings_count')
            .groupBy('gc.district_name')
            .getRawMany();

        const buildingMap = new Map(buildingStats.map((b) => [b.district_name, parseInt(b.buildings_count) || 0]));

        return districts.map((d) => {
            const stats = statsMap.get(d.name) || { total_count: 0, processed_count: 0 };
            return {
                id: d.id,
                name: d.name,
                total_grid_cells: parseInt(stats.total_count) || 0,
                processed_count: parseInt(stats.processed_count) || 0,
                total_buildings: buildingMap.get(d.name) || 0,
            };
        });
    }

    /**
     * Get all grid cells for a specific district
     */
    async getGridCellsByDistrictId(districtId: number) {
        const district = await this.districtRepo.findOne({
            where: { id: districtId },
        });

        if (!district) {
            throw new HttpException('District not found', HttpStatus.NOT_FOUND);
        }

        const gridCells = await this.gridCellRepo.find({
            where: { district_name: district.name },
            relations: ['buildings', 'landUsages'],
            order: { grid_code: 'ASC' },
        });

        return {
            district: {
                id: district.id,
                name: district.name,
            },
            total_count: gridCells.length,
            grid_cells: gridCells,
        };
    }
}
