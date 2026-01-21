import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from '../../database/entities/feedback.entity';
import { CreateFeedbackDto, UpdateFeedbackDto, GetFeedbacksDto } from './dto';

@Injectable()
export class FeedbackService {
    constructor(
        @InjectRepository(Feedback)
        private feedbackRepo: Repository<Feedback>,
    ) { }

    /**
     * Create new feedback
     */
    async create(dto: CreateFeedbackDto) {
        const feedback = this.feedbackRepo.create(dto);
        await this.feedbackRepo.save(feedback);

        return {
            success: true,
            message: 'Feedback submitted successfully',
            data: {
                id: feedback.id,
                category: feedback.category,
                created_at: feedback.created_at,
            },
        };
    }

    /**
     * Get all feedbacks with pagination and filter
     */
    async findAll(query: GetFeedbacksDto) {
        const { status, page = 1, limit = 20 } = query;

        const queryBuilder = this.feedbackRepo.createQueryBuilder('f');

        if (status) {
            queryBuilder.where('f.status = :status', { status });
        }

        const total = await queryBuilder.getCount();

        const data = await queryBuilder
            .orderBy('f.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Update feedback status (admin)
     */
    async update(id: number, dto: UpdateFeedbackDto) {
        const feedback = await this.feedbackRepo.findOne({ where: { id } });

        if (!feedback) {
            throw new HttpException('Feedback not found', HttpStatus.NOT_FOUND);
        }

        feedback.status = dto.status;
        if (dto.admin_note) {
            feedback.admin_note = dto.admin_note;
        }

        await this.feedbackRepo.save(feedback);

        return {
            success: true,
            message: 'Feedback updated successfully',
            data: feedback,
        };
    }
}
