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
import { GetGridCellsDto, DetectRequestDto } from './dto';

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
