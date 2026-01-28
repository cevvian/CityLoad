import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { District } from '../../database/entities/district.entity';
import { GridCell } from '../../database/entities/grid-cell.entity';
import { AiBuilding } from '../../database/entities/ai-building.entity';
import { AiLandUsage } from '../../database/entities/ai-land-usage.entity';
import { GridCellStatus } from '../../database/entities/enums/grid-cell-status.enum';

@Injectable()
export class DistrictsService {
    constructor(
        @InjectRepository(District)
        private districtRepo: Repository<District>,
        @InjectRepository(GridCell)
        private gridCellRepo: Repository<GridCell>,
        @InjectRepository(AiBuilding)
        private aiBuildingRepo: Repository<AiBuilding>,
        @InjectRepository(AiLandUsage)
        private aiLandUsageRepo: Repository<AiLandUsage>,
    ) { }

    async findAll() {
        const districts = await this.districtRepo.find({
            select: ['id', 'name'],
        });

        const gridCellStats = await this.gridCellRepo
            .createQueryBuilder('gc')
            .select('gc.district_name', 'district_name')
            .addSelect('COUNT(*)', 'total_count')
            .addSelect(`SUM(CASE WHEN gc.status = '${GridCellStatus.PROCESSED}' THEN 1 ELSE 0 END)`, 'processed_count')
            .groupBy('gc.district_name')
            .getRawMany();

        const statsMap = new Map(gridCellStats.map((s) => [s.district_name, s]));

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

    async getDistrictsOverlay() {
        const districts = await this.districtRepo
            .createQueryBuilder('d')
            .select([
                'd.id AS id',
                'd.name AS name',
                'ST_AsGeoJSON(d.geom)::json AS geom',
                'ST_Area(d.geom::geography) AS area_m2',
            ])
            .getRawMany();

        const gridStats = await this.gridCellRepo
            .createQueryBuilder('gc')
            .select('gc.district_name', 'district_name')
            .addSelect('COUNT(*)', 'total_grid_cells')
            .addSelect(`SUM(CASE WHEN gc.status = '${GridCellStatus.PROCESSED}' THEN 1 ELSE 0 END)`, 'processed_cells')
            .addSelect(`SUM(CASE WHEN gc.status = '${GridCellStatus.PENDING}' THEN 1 ELSE 0 END)`, 'pending_cells')
            .addSelect(`SUM(CASE WHEN gc.status = '${GridCellStatus.PROCESSING}' THEN 1 ELSE 0 END)`, 'processing_cells')
            .addSelect('COALESCE(SUM(gc.building_area_m2), 0)', 'total_building_area_m2')
            .addSelect('COALESCE(AVG(gc.density_ratio), 0)', 'avg_density_ratio')
            .groupBy('gc.district_name')
            .getRawMany();

        const gridStatsMap = new Map(gridStats.map((s) => [s.district_name, s]));

        // Get building counts per district
        const buildingStats = await this.gridCellRepo
            .createQueryBuilder('gc')
            .leftJoin('gc.buildings', 'b')
            .select('gc.district_name', 'district_name')
            .addSelect('COUNT(b.id)', 'buildings_count')
            .groupBy('gc.district_name')
            .getRawMany();

        const buildingMap = new Map(buildingStats.map((b) => [b.district_name, parseInt(b.buildings_count) || 0]));

        // Get land usage summary per district
        const landUsageStats = await this.aiLandUsageRepo
            .createQueryBuilder('lu')
            .leftJoin('lu.gridCell', 'gc')
            .select('gc.district_name', 'district_name')
            .addSelect('lu.land_type', 'land_type')
            .addSelect('COUNT(*)', 'count')
            .addSelect('COALESCE(SUM(lu.area_m2), 0)', 'total_area')
            .groupBy('gc.district_name')
            .addGroupBy('lu.land_type')
            .getRawMany();

        // Group land usage by district
        const landUsageMap = new Map<string, Record<string, { count: number; area: number }>>();
        landUsageStats.forEach((lu) => {
            if (!landUsageMap.has(lu.district_name)) {
                landUsageMap.set(lu.district_name, {});
            }
            landUsageMap.get(lu.district_name)![lu.land_type] = {
                count: parseInt(lu.count) || 0,
                area: parseFloat(lu.total_area) || 0,
            };
        });

        // Build GeoJSON FeatureCollection
        const features = districts.map((d) => {
            const stats = gridStatsMap.get(d.name) || {};
            const totalGridCells = parseInt(stats.total_grid_cells) || 0;
            const processedCells = parseInt(stats.processed_cells) || 0;
            const progress = totalGridCells > 0 ? Math.round((processedCells / totalGridCells) * 100) : 0;

            const areaM2 = parseFloat(d.area_m2) || 0;
            const areaKm2 = areaM2 / 1000000;
            const totalBuildings = buildingMap.get(d.name) || 0;
            const totalBuildingAreaM2 = parseFloat(stats.total_building_area_m2) || 0;

            // Density calculations
            const buildingDensityPerKm2 = areaKm2 > 0 ? Math.round(totalBuildings / areaKm2) : 0;
            const buildingCoveragePercent = areaM2 > 0 ? Math.round((totalBuildingAreaM2 / areaM2) * 10000) / 100 : 0;

            return {
                type: 'Feature',
                properties: {
                    id: d.id,
                    name: d.name,
                    area_km2: Math.round(areaKm2 * 100) / 100,
                    // Grid cell stats
                    total_grid_cells: totalGridCells,
                    processed_cells: processedCells,
                    pending_cells: parseInt(stats.pending_cells) || 0,
                    processing_cells: parseInt(stats.processing_cells) || 0,
                    progress_percent: progress,
                    // Building stats
                    total_buildings: totalBuildings,
                    total_building_area_m2: Math.round(totalBuildingAreaM2),
                    // Density metrics
                    avg_density_ratio: Math.round((parseFloat(stats.avg_density_ratio) || 0) * 100) / 100,
                    building_density_per_km2: buildingDensityPerKm2,
                    building_coverage_percent: buildingCoveragePercent,
                    // Land usage breakdown
                    land_usage: landUsageMap.get(d.name) || {},
                    // For styling
                    layer: 'districts',
                },
                geometry: d.geom,
            };
        });

        // Calculate city-wide totals
        const totals = {
            total_districts: districts.length,
            total_grid_cells: gridStats.reduce((sum, s) => sum + (parseInt(s.total_grid_cells) || 0), 0),
            total_processed: gridStats.reduce((sum, s) => sum + (parseInt(s.processed_cells) || 0), 0),
            total_buildings: Array.from(buildingMap.values()).reduce((sum, c) => sum + c, 0),
        };

        return {
            type: 'FeatureCollection',
            features,
            stats: totals,
        };
    }

    async getDistrictDetail(districtId: number) {
        const district = await this.districtRepo
            .createQueryBuilder('d')
            .select([
                'd.id AS id',
                'd.name AS name',
                'ST_AsGeoJSON(d.geom)::json AS geom',
                'ST_Area(d.geom::geography) AS area_m2',
            ])
            .where('d.id = :id', { id: districtId })
            .getRawOne();

        if (!district) {
            throw new HttpException('District not found', HttpStatus.NOT_FOUND);
        }

        const gridStats = await this.gridCellRepo
            .createQueryBuilder('gc')
            .select('COUNT(*)', 'total')
            .addSelect(`SUM(CASE WHEN gc.status = '${GridCellStatus.PROCESSED}' THEN 1 ELSE 0 END)`, 'processed')
            .addSelect(`SUM(CASE WHEN gc.status = '${GridCellStatus.PENDING}' THEN 1 ELSE 0 END)`, 'pending')
            .addSelect(`SUM(CASE WHEN gc.status = '${GridCellStatus.PROCESSING}' THEN 1 ELSE 0 END)`, 'processing')
            .addSelect(`SUM(CASE WHEN gc.status = '${GridCellStatus.ERROR}' THEN 1 ELSE 0 END)`, 'error')
            .addSelect('COALESCE(SUM(gc.building_area_m2), 0)', 'building_area')
            .addSelect('COALESCE(SUM(gc.total_area_m2), 0)', 'total_area')
            .addSelect('COALESCE(AVG(gc.density_ratio), 0)', 'avg_density')
            .where('gc.district_name = :name', { name: district.name })
            .getRawOne();

        const buildingCount = await this.aiBuildingRepo
            .createQueryBuilder('b')
            .leftJoin('b.gridCell', 'gc')
            .where('gc.district_name = :name', { name: district.name })
            .getCount();

        const landUsages = await this.aiLandUsageRepo
            .createQueryBuilder('lu')
            .leftJoin('lu.gridCell', 'gc')
            .select('lu.land_type', 'land_type')
            .addSelect('COUNT(*)', 'count')
            .addSelect('COALESCE(SUM(lu.area_m2), 0)', 'total_area_m2')
            .where('gc.district_name = :name', { name: district.name })
            .groupBy('lu.land_type')
            .getRawMany();

        const totalGridCells = parseInt(gridStats.total) || 0;
        const processedCells = parseInt(gridStats.processed) || 0;

        return {
            id: district.id,
            name: district.name,
            geom: district.geom,
            area_km2: Math.round((parseFloat(district.area_m2) || 0) / 1000000 * 100) / 100,
            grid_cells: {
                total: totalGridCells,
                processed: processedCells,
                pending: parseInt(gridStats.pending) || 0,
                processing: parseInt(gridStats.processing) || 0,
                error: parseInt(gridStats.error) || 0,
                progress_percent: totalGridCells > 0 ? Math.round((processedCells / totalGridCells) * 100) : 0,
            },
            buildings: {
                count: buildingCount,
                total_area_m2: Math.round(parseFloat(gridStats.building_area) || 0),
            },
            density: {
                avg_ratio: Math.round((parseFloat(gridStats.avg_density) || 0) * 100) / 100,
                total_area_m2: Math.round(parseFloat(gridStats.total_area) || 0),
            },
            land_usage: landUsages.map((lu) => ({
                type: lu.land_type,
                count: parseInt(lu.count) || 0,
                area_m2: Math.round(parseFloat(lu.total_area_m2) || 0),
            })),
        };
    }
}
