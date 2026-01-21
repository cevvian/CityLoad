import { Controller, Get, Post, Patch, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, UpdateFeedbackDto, GetFeedbacksDto } from './dto';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) { }

    @Post()
    @ApiOperation({ summary: 'Submit feedback about detection accuracy' })
    @ApiResponse({ status: 201, description: 'Feedback submitted successfully' })
    async createFeedback(@Body() body: CreateFeedbackDto) {
        return this.feedbackService.create(body);
    }

    @Get()
    @ApiOperation({ summary: 'Get list of feedbacks (admin)' })
    @ApiResponse({ status: 200, description: 'List of feedbacks with pagination' })
    async getFeedbacks(@Query() query: GetFeedbacksDto) {
        return this.feedbackService.findAll(query);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update feedback status (admin)' })
    @ApiResponse({ status: 200, description: 'Feedback updated successfully' })
    @ApiResponse({ status: 404, description: 'Feedback not found' })
    async updateFeedback(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateFeedbackDto,
    ) {
        return this.feedbackService.update(id, body);
    }
}
