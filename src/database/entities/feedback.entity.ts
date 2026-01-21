import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FeedbackStatus } from './enums/feedback-status.enum';
import { FeedbackCategory } from './enums/feedback-category.enum';
import { GridCell } from './grid-cell.entity';

@Entity('feedbacks')
export class Feedback {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ type: 'bigint', nullable: true })
    grid_cell_id: number;

    @Column({ type: 'varchar', length: 100 })
    full_name: string;

    @Column({ type: 'varchar', length: 255 })
    email: string;

    @Column({ type: 'enum', enum: FeedbackCategory })
    category: FeedbackCategory;

    @Column({ type: 'float', nullable: true })
    lat: number;

    @Column({ type: 'float', nullable: true })
    lng: number;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'enum', enum: FeedbackStatus, default: FeedbackStatus.PENDING })
    status: FeedbackStatus;

    @Column({ type: 'text', nullable: true })
    admin_note: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => GridCell, { nullable: true })
    @JoinColumn({ name: 'grid_cell_id' })
    gridCell: GridCell;
}
