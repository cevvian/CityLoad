import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { GridCell } from '../../database/entities/grid-cell.entity';
import { AiBuilding } from '../../database/entities/ai-building.entity';
import { AiLandUsage } from '../../database/entities/ai-land-usage.entity';
import { GridCellStatus } from '../../database/entities/enums/grid-cell-status.enum';
import { DetectionCallbackDto, FetchTasksQueryDto } from './dto';

@Injectable()
export class DetectionService {
    constructor(
        @InjectRepository(GridCell)
        private gridCellRepo: Repository<GridCell>,
        @InjectRepository(AiBuilding)
        private aiBuildingRepo: Repository<AiBuilding>,
        @InjectRepository(AiLandUsage)
        private aiLandUsageRepo: Repository<AiLandUsage>,
        private dataSource: DataSource,
    ) { }

    async fetchTasks(query: FetchTasksQueryDto) {
        const limit = query.limit || 5;

        const tasks = await this.dataSource.transaction(async (manager) => {
            const pendingCells = await manager
                .createQueryBuilder(GridCell, 'gc')
                .select([
                    'gc.id AS id',
                    'gc.grid_code AS grid_code',
                    'ST_AsGeoJSON(gc.geom)::json AS geom',
                    'ST_XMin(gc.geom) AS min_lon',
                    'ST_YMin(gc.geom) AS min_lat',
                    'ST_XMax(gc.geom) AS max_lon',
                    'ST_YMax(gc.geom) AS max_lat',
                ])
                .where('gc.status = :status', { status: GridCellStatus.PENDING })
                .orderBy('gc.id', 'ASC')
                .limit(limit)
                .setLock('pessimistic_write_or_fail')
                .getRawMany();

            if (pendingCells.length === 0) {
                return [];
            }

            const ids = pendingCells.map((cell) => cell.id);
            await manager
                .createQueryBuilder()
                .update(GridCell)
                .set({
                    status: GridCellStatus.PROCESSING,
                    last_updated: new Date(),
                })
                .whereInIds(ids)
                .execute();

            // 3. Transform to response format
            return pendingCells.map((cell) => ({
                id: cell.id,
                grid_code: cell.grid_code,
                bbox: [
                    parseFloat(cell.min_lon),
                    parseFloat(cell.min_lat),
                    parseFloat(cell.max_lon),
                    parseFloat(cell.max_lat),
                ] as [number, number, number, number],
                geom: cell.geom,
            }));
        });

        return {
            tasks,
            count: tasks.length,
            fetched_at: new Date().toISOString(),
        };
    }

    async getStatus(gridCellId: number) {
        const gridCell = await this.gridCellRepo.findOne({
            where: { id: gridCellId },
            relations: ['buildings', 'landUsages'],
        });

        if (!gridCell) {
            throw new HttpException('Grid cell not found', HttpStatus.NOT_FOUND);
        }

        return {
            grid_cell_id: gridCellId,
            grid_code: gridCell.grid_code,
            status: gridCell.status || GridCellStatus.PENDING,
            buildings_count: gridCell.buildings?.length || 0,
            land_usages_count: gridCell.landUsages?.length || 0,
            last_updated: gridCell.last_updated,
        };
    }


    async handleCallback(dto: DetectionCallbackDto) {
        const { grid_cell_id, status, buildings, land_usages, stats, error_message } = dto;

        const gridCell = await this.gridCellRepo.findOne({
            where: { id: grid_cell_id },
        });

        if (!gridCell) {
            throw new HttpException('Grid cell not found', HttpStatus.NOT_FOUND);
        }

        if (status === 'error' || status === 'ERROR') {
            await this.gridCellRepo.update(grid_cell_id, {
                status: GridCellStatus.ERROR,
                last_updated: new Date(),
            });

            return {
                success: false,
                grid_cell_id,
                message: error_message || 'Detection failed',
            };
        }

        if (buildings && buildings.length > 0) {
            await this.aiBuildingRepo.delete({ grid_cell_id });

            const buildingEntities = buildings.map((b) =>
                this.aiBuildingRepo.create({
                    grid_cell_id,
                    geom: b.geom,
                    confidence_score: b.confidence,
                }),
            );
            await this.aiBuildingRepo.save(buildingEntities);
        }

        if (land_usages && land_usages.length > 0) {
            await this.aiLandUsageRepo.delete({ grid_cell_id });

            const landUsageEntities = land_usages.map((lu) =>
                this.aiLandUsageRepo.create({
                    grid_cell_id,
                    geom: lu.geom,
                    land_type: lu.class_name,
                    area_m2: lu.area_m2,
                }),
            );
            await this.aiLandUsageRepo.save(landUsageEntities);
        }
        await this.gridCellRepo.update(grid_cell_id, {
            status: GridCellStatus.PROCESSED,
            last_updated: new Date(),
            building_area_m2: stats?.building_area_m2 ?? 0,
            density_ratio: stats?.density_ratio ?? 0,
        });

        return {
            success: true,
            grid_cell_id,
            buildings_saved: buildings?.length || 0,
            land_usages_saved: land_usages?.length || 0,
        };
    }
}
