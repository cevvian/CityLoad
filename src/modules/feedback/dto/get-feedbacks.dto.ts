import { IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FeedbackStatus } from 'src/database/entities/enums/feedback-status.enum';

export class GetFeedbacksDto {
    @ApiPropertyOptional({ example: 'PENDING', enum: FeedbackStatus })
    @IsOptional()
    @IsEnum(FeedbackStatus)
    status?: FeedbackStatus;

    @ApiPropertyOptional({ example: 1, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ example: 20, default: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 20;
}
