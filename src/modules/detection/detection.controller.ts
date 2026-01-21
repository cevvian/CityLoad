import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DetectionService } from './detection.service';
import { DetectionCallbackDto } from './dto';

@ApiTags('Detection')
@Controller('detection')
export class DetectionController {
    constructor(private readonly detectionService: DetectionService) { }

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
}
