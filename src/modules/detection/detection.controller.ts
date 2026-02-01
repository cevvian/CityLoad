import { Controller, Get, Post, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DetectionService } from './detection.service';
import { DetectionCallbackDto, FetchTasksQueryDto, FetchTasksResponseDto } from './dto';

@ApiTags('Detection')
@Controller('detection')
export class DetectionController {
    constructor(private readonly detectionService: DetectionService) { }

    @Get('fetch-tasks')
    @ApiOperation({
        summary: 'Fetch pending tasks for AI Worker',
        description: 'Returns PENDING grid cells and atomically updates their status to PROCESSING (Fetch & Lock pattern). Can filter by district.',
    })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 5, description: 'Number of tasks to fetch (max 20)' })
    @ApiQuery({ name: 'district_name', required: false, type: String, example: 'Quận 1', description: 'Filter by district name' })
    @ApiResponse({ status: 200, description: 'List of tasks', type: FetchTasksResponseDto })
    async fetchTasks(@Query() query: FetchTasksQueryDto) {
        return this.detectionService.fetchTasks(query);
    }

    @Get('status/:gridCellId')
    @ApiOperation({ summary: 'Get detection status for a grid cell' })
    @ApiResponse({ status: 200, description: 'Detection status' })
    @ApiResponse({ status: 404, description: 'Grid cell not found' })
    async getStatus(@Param('gridCellId', ParseIntPipe) gridCellId: number) {
        return this.detectionService.getStatus(gridCellId);
    }

    @Post('callback')
    @ApiOperation({ summary: 'Callback endpoint for AI service when detection is complete' })
    @ApiResponse({ status: 200, description: 'Callback processed successfully' })
    @ApiResponse({ status: 404, description: 'Grid cell not found' })
    async handleCallback(@Body() body: DetectionCallbackDto) {
        return this.detectionService.handleCallback(body);
    }

    @Post('submit-result')
    @ApiOperation({ 
        summary: 'Submit AI detection result',
        description: 'Endpoint for AI service to submit detection results (buildings, land usages) for a grid cell',
    })
    @ApiResponse({ status: 200, description: 'Result submitted successfully' })
    @ApiResponse({ status: 404, description: 'Grid cell not found' })
    async submitResult(@Body() body: DetectionCallbackDto) {
        return this.detectionService.handleCallback(body);
    }
}
