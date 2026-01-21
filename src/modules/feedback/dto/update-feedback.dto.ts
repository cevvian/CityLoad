import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackStatus } from 'src/database/entities/enums/feedback-status.enum';

export class UpdateFeedbackDto {
    @ApiProperty({
        example: 'RESOLVED',
        enum: FeedbackStatus,
        description: 'PENDING | RESOLVED | REJECTED'
    })
    @IsEnum(FeedbackStatus)
    status: FeedbackStatus;

    @ApiPropertyOptional({ example: 'Đã xác nhận và cập nhật vào hệ thống' })
    @IsOptional()
    @IsString()
    admin_note?: string;
}
