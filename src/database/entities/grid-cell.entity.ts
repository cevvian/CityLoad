import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AiBuilding } from './ai-building.entity';
import { AiLandUsage } from './ai-land-usage.entity';
@Entity('grid_cells')
export class GridCell {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;
    @Column({ type: 'varchar', length: 50, nullable: true })
    grid_code: string;
    @Column({ type: 'varchar', length: 100, nullable: true })
    district_name: string;
    @Column({ type: 'varchar', length: 100, nullable: true })
    ward_name: string;
    @Column({ type: 'geometry', spatialFeatureType: 'Polygon', srid: 4326 })
    geom: string;
    @Column({ type: 'float', nullable: true })
    total_area_m2: number;
    @Column({ type: 'float', nullable: true })
    building_area_m2: number;
    @Column({ type: 'float', nullable: true })
    urban_land_area_m2: number;
    @Column({ type: 'float', nullable: true })
    density_ratio: number;
    @Column({ type: 'varchar', length: 20, nullable: true })
    status: string;
    @Column({ type: 'timestamp', nullable: true })
    last_updated: Date;
    @OneToMany(() => AiBuilding, (building) => building.gridCell)
    buildings: AiBuilding[];
    @OneToMany(() => AiLandUsage, (landUsage) => landUsage.gridCell)
    landUsages: AiLandUsage[];
}