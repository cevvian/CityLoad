import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('districts')
export class District {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', nullable: true })
    name: string;

    @Column({ type: 'geometry', spatialFeatureType: 'Polygon', srid: 4326, nullable: true })
    geometry: string;  // Match existing column name from backup
}