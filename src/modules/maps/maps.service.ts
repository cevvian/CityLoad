import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { GridCell } from '../../database/entities/grid-cell.entity';
import { AiBuilding } from '../../database/entities/ai-building.entity';
import { AiLandUsage } from '../../database/entities/ai-land-usage.entity';
import { GridCellStatus } from '../../database/entities/enums/grid-cell-status.enum';
import { GetGridCellsDto, DetectRequestDto, LAND_TYPE_COLORS } from './dto';

@Injectable()
export class MapsService {
    constructor(
        @InjectRepository(GridCell)
        private gridCellRepo: Repository<GridCell>,
        @InjectRepository(AiBuilding)
        private aiBuildingRepo: Repository<AiBuilding>,
        @InjectRepository(AiLandUsage)
        private aiLandUsageRepo: Repository<AiLandUsage>,
        private httpService: HttpService,
        private configService: ConfigService,
    ) { }

    async getOverlayByBounds(query: GetGridCellsDto) {
        const { minLat, minLng, maxLat, maxLng } = query;
        const GRID_CELL_LIMIT = 500;
        const FEATURES_LIMIT = 5000;

        const gridCells = await this.gridCellRepo
            .createQueryBuilder('gc')
            .select([
                'gc.id',
                'gc.grid_code',
                'gc.district_name',
                'gc.status',
                'gc.density_ratio',
                'gc.total_area_m2',
                'gc.building_area_m2',
                'ST_AsGeoJSON(gc.geom)::json AS geom',
            ])
            .where(
                `ST_Intersects(gc.geom, ST_MakeEnvelope(:minLng, :minLat, :maxLng, :maxLat, 4326))`,
                { minLng, minLat, maxLng, maxLat },
            )
            .orderBy('gc.id', 'ASC')
            .limit(GRID_CELL_LIMIT)
            .getRawMany();

        const gridCellIds = gridCells.map((gc) => gc.gc_id);

        const buildings = gridCellIds.length > 0
            ? await this.aiBuildingRepo
                .createQueryBuilder('b')
                .select([
                    'b.id',
                    'b.grid_cell_id',
                    'b.confidence_score',
                    'ST_AsGeoJSON(b.geom)::json AS geom',
                ])
                .where('b.grid_cell_id IN (:...ids)', { ids: gridCellIds })
                .limit(FEATURES_LIMIT)
                .getRawMany()
            : [];
  
        const landUsages = gridCellIds.length > 0
            ? await this.aiLandUsageRepo
                .createQueryBuilder('lu')
                .select([
                    'lu.id',
                    'lu.grid_cell_id',
                    'lu.land_type',
                    'lu.area_m2',
                    'ST_AsGeoJSON(lu.geom)::json AS geom',
                ])
                .where('lu.grid_cell_id IN (:...ids)', { ids: gridCellIds })
                .limit(FEATURES_LIMIT)
                .getRawMany()
            : [];

        const buildingsCount = new Map<number, number>();
        for (const b of buildings) {
            const cellId = b.b_grid_cell_id;
            buildingsCount.set(cellId, (buildingsCount.get(cellId) || 0) + 1);
        }

        let processedCells = 0;
        let totalDensity = 0;
        for (const gc of gridCells) {
            if (gc.gc_status === GridCellStatus.PROCESSED) processedCells++;
            totalDensity += (gc.gc_density_ratio || 0);
        }
        const avgDensity = gridCells.length > 0 ? totalDensity / gridCells.length : 0;

        return {
            success: true,
            bounds: { minLat, minLng, maxLat, maxLng },
            hasMore: gridCells.length >= GRID_CELL_LIMIT,

            grid_cells: {
                type: 'FeatureCollection',
                features: gridCells.map((gc) => ({
                    type: 'Feature',
                    properties: {
                        id: gc.gc_id,
                        grid_code: gc.gc_grid_code,
                        district_name: gc.gc_district_name,
                        status: gc.gc_status,
                        density_ratio: gc.gc_density_ratio,
                        buildings_count: buildingsCount.get(gc.gc_id) || 0,
                        layer: 'grid_cells',
                    },
                    geometry: gc.geom,
                })),
            },

            buildings: {
                type: 'FeatureCollection',
                features: buildings.map((b) => ({
                    type: 'Feature',
                    properties: {
                        id: b.b_id,
                        grid_cell_id: b.b_grid_cell_id,
                        confidence_score: b.b_confidence_score,
                        layer: 'buildings',
                    },
                    geometry: b.geom,
                })),
            },

            land_usages: {
                type: 'FeatureCollection',
                features: landUsages.map((lu) => ({
                    type: 'Feature',
                    properties: {
                        id: lu.lu_id,
                        grid_cell_id: lu.lu_grid_cell_id,
                        land_type: lu.lu_land_type,
                        area_m2: lu.lu_area_m2,
                        layer: 'land_usage',
                        color: LAND_TYPE_COLORS[lu.lu_land_type] || LAND_TYPE_COLORS.unknown,
                    },
                    geometry: lu.geom,
                })),
            },

            stats: {
                total_grid_cells: gridCells.length,
                processed_cells: processedCells,
                total_buildings: buildings.length,
                avg_density_ratio: Math.round(avgDensity * 100) / 100,
            },
        };
    }

    async getGridCellsByBounds(query: GetGridCellsDto) {
        const { minLat, minLng, maxLat, maxLng } = query;

        const gridCells = await this.gridCellRepo
            .createQueryBuilder('gc')
            .leftJoinAndSelect('gc.buildings', 'buildings')
            .leftJoinAndSelect('gc.landUsages', 'landUsages')
            .where(
                `ST_Intersects(gc.geom, ST_MakeEnvelope(:minLng, :minLat, :maxLng, :maxLat, 4326))`,
                { minLng, minLat, maxLng, maxLat },
            )
            .getMany();

        return {
            count: gridCells.length,
            data: gridCells,
        };
    }


    async detectObjects(dto: DetectRequestDto) {
        const { grid_cell_id, bounds, image_url } = dto;

        // 1. Check if grid cell exists
        const gridCell = await this.gridCellRepo.findOne({
            where: { id: grid_cell_id },
            relations: ['buildings', 'landUsages'],
        });

        if (!gridCell) {
            throw new HttpException('Grid cell not found', HttpStatus.NOT_FOUND);
        }

        // 2. Check if already processed (has detection data)
        if (gridCell.buildings && gridCell.buildings.length > 0) {
            return {
                status: 'cached',
                grid_cell_id,
                buildings_count: gridCell.buildings.length,
                land_usages: gridCell.landUsages?.map((lu) => ({
                    type: lu.land_type,
                    area_m2: lu.area_m2,
                })) || [],
            };
        }

        // 3. Call AI FastAPI service
        const aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL');
        if (!aiServiceUrl) {
            throw new HttpException('AI service URL not configured', HttpStatus.SERVICE_UNAVAILABLE);
        }

        try {
            const response = await firstValueFrom(
                this.httpService.post(`${aiServiceUrl}/detect`, {
                    grid_cell_id,
                    bounds,
                    image_url,
                }),
            );

            const aiResult = response.data;

            // 4. Save buildings to DB
            if (aiResult.buildings && aiResult.buildings.length > 0) {
                const buildingEntities = aiResult.buildings.map((b: any) =>
                    this.aiBuildingRepo.create({
                        grid_cell_id,
                        geom: b.geom,
                        confidence_score: b.confidence_score,
                    }),
                );
                await this.aiBuildingRepo.save(buildingEntities);
            }

            // 5. Save land usages to DB
            if (aiResult.land_usages && aiResult.land_usages.length > 0) {
                const landUsageEntities = aiResult.land_usages.map((lu: any) =>
                    this.aiLandUsageRepo.create({
                        grid_cell_id,
                        geom: lu.geom,
                        land_type: lu.land_type,
                        area_m2: lu.area_m2,
                    }),
                );
                await this.aiLandUsageRepo.save(landUsageEntities);
            }

            // 6. Update grid cell status
            await this.gridCellRepo.update(grid_cell_id, { status: GridCellStatus.PROCESSED });

            return {
                status: 'success',
                grid_cell_id,
                buildings_count: aiResult.buildings?.length || 0,
                land_usages: aiResult.land_usages || [],
            };
        } catch (error) {
            console.error('AI Service error:', error.message);
            throw new HttpException(
                'Failed to process detection',
                HttpStatus.BAD_GATEWAY,
            );
        }
    }
}
