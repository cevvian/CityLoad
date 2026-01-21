import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { AiBuilding } from './ai-building.entity';
import { AiLandUsage } from './ai-land-usage.entity';
import { GridCellStatus } from './enums/grid-cell-status.enum';
import type { Geometry } from 'geojson';

@Entity('grid_cells')
export class GridCell {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'varchar', length: 50, unique: true })
    grid_code: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    district_name: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    ward_name: string;

    @Index({ spatial: true })
    @Column({
        type: 'geometry',
        spatialFeatureType: 'Polygon',
        srid: 4326,
        select: false
    })
    geom: Geometry;

    @Column({ type: 'float', default: 0 })
    total_area_m2: number;

    @Column({ type: 'float', default: 0 })
    building_area_m2: number;

    @Column({ type: 'float', default: 0 })
    urban_land_area_m2: number;

    @Column({ type: 'float', default: 0 })
    density_ratio: number;

    @Column({ type: 'enum', enum: GridCellStatus, default: GridCellStatus.PENDING })
    status: GridCellStatus;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    last_updated: Date;

    @OneToMany(() => AiBuilding, (building) => building.gridCell)
    buildings: AiBuilding[];

    @OneToMany(() => AiLandUsage, (landUsage) => landUsage.gridCell)
    landUsages: AiLandUsage[];
}