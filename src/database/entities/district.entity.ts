import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('districts')
export class District {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ type: 'varchar', length: 100 })
    name: string;
    @Column({ type: 'geometry', spatialFeatureType: 'Polygon', srid: 4326, nullable: true })
    geom: string;
}