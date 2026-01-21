import { IsNumber, IsString, IsEmail, IsEnum, IsOptional, MinLength, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackCategory } from 'src/database/entities/enums/feedback-category.enum';

export class CreateFeedbackDto {
    @ApiProperty({ example: 'Nguyễn Văn A' })
    @IsString()
    @MinLength(2)
    full_name: string;

    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({ example: 1, description: 'Grid cell ID related to feedback' })
    @IsOptional()
    @IsNumber()
    grid_cell_id?: number;

    @ApiProperty({
        example: 'WRONG_DETECTION',
        enum: FeedbackCategory,
        description: 'WRONG_DETECTION | MISSING_OBJECT | WRONG_CLASSIFICATION | OTHER'
    })
    @IsEnum(FeedbackCategory)
    category: FeedbackCategory;

    @ApiPropertyOptional({ example: 10.78, description: 'Latitude of the issue location' })
    @IsOptional()
    @IsNumber()
    @Min(-90)
    @Max(90)
    lat?: number;

    @ApiPropertyOptional({ example: 106.68, description: 'Longitude of the issue location' })
    @IsOptional()
    @IsNumber()
    @Min(-180)
    @Max(180)
    lng?: number;

    @ApiProperty({ example: 'Thiếu 1 tòa nhà ở góc đường...', description: 'Detailed feedback message' })
    @IsString()
    @MinLength(10)
    message: string;
}
