import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchByAddressDto {
    @ApiProperty({ example: 'Nguyễn Huệ, Quận 1', description: 'Address or place name' })
    @IsString()
    @MinLength(2)
    q: string;

    @ApiPropertyOptional({ example: 5, description: 'Limit results' })
    @IsOptional()
    limit?: number;
}
