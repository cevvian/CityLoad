import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GridCell } from '../../database/entities/grid-cell.entity';
import { AiBuilding } from '../../database/entities/ai-building.entity';
import { AiLandUsage } from '../../database/entities/ai-land-usage.entity';
import { GridCellStatus } from '../../database/entities/enums/grid-cell-status.enum';
import { DetectionCallbackDto } from './dto';

@Injectable()
export class DetectionService {
    constructor(
        @InjectRepository(GridCell)
        private gridCellRepo: Repository<GridCell>,
        @InjectRepository(AiBuilding)
        private aiBuildingRepo: Repository<AiBuilding>,
        @InjectRepository(AiLandUsage)
        private aiLandUsageRepo: Repository<AiLandUsage>,
    ) { }

    /**
     * Get detection status for a grid cell
     */
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

    /**
     * Handle callback from AI service when detection is complete
     */
    async handleCallback(dto: DetectionCallbackDto) {
        const { grid_cell_id, status, buildings, land_usages, error_message } = dto;

        // 1. Check if grid cell exists
        const gridCell = await this.gridCellRepo.findOne({
            where: { id: grid_cell_id },
        });

        if (!gridCell) {
            throw new HttpException('Grid cell not found', HttpStatus.NOT_FOUND);
        }

        // 2. Handle error case
        if (status === 'error') {
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

        // 3. Save buildings
        if (buildings && buildings.length > 0) {
            // Clear existing buildings for this grid cell
            await this.aiBuildingRepo.delete({ grid_cell_id });

            const buildingEntities = buildings.map((b) =>
                this.aiBuildingRepo.create({
                    grid_cell_id,
                    geom: b.geom,
                    confidence_score: b.confidence_score,
                }),
            );
            await this.aiBuildingRepo.save(buildingEntities);
        }

        // 4. Save land usages
        if (land_usages && land_usages.length > 0) {
            // Clear existing land usages for this grid cell
            await this.aiLandUsageRepo.delete({ grid_cell_id });

            const landUsageEntities = land_usages.map((lu) =>
                this.aiLandUsageRepo.create({
                    grid_cell_id,
                    geom: lu.geom,
                    land_type: lu.land_type,
                    area_m2: lu.area_m2,
                }),
            );
            await this.aiLandUsageRepo.save(landUsageEntities);
        }

        // 5. Update grid cell status
        await this.gridCellRepo.update(grid_cell_id, {
            status: GridCellStatus.PROCESSED,
            last_updated: new Date(),
            building_area_m2: buildings?.length || 0,
        });

        return {
            success: true,
            grid_cell_id,
            buildings_saved: buildings?.length || 0,
            land_usages_saved: land_usages?.length || 0,
        };
    }
}
