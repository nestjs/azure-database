import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { EventDTO, VectorSearchDTO, FullTextSearchDTO, HybridSearchDTO } from './event.dto';
import { EventService } from './event.service';

const SPLIT_SEP = /[.,|-]+/; // Choose your own separator for the hierarchical partition key

@Controller('event')
export class EventController {
  private readonly logger = new Logger(EventController.name);

  constructor(private readonly events: EventService) {}

  @Get()
  async getEvents() {
    return await this.events.getEvents();
  }

  @Get(':type/:id')
  async getEvent(@Param('id') id: string, @Param('type') type: string) {
    const event = await this.events.getEvent(id, type.split(SPLIT_SEP));
    if (event === undefined) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  @Post()
  async createEvent(@Body() eventDto: EventDTO) {
    return await this.events.create(eventDto);
  }

  @Delete(':type/:id')
  async deleteEvent(@Param('id') id: string, @Param('type') type: string) {
    return await this.events.deleteEvent(id, type.split(SPLIT_SEP));
  }

  @Put(':type/:id')
  async updateEvent(
    @Param('id') id: string,
    @Param('type') type: string,
    @Body() eventDto: EventDTO,
  ) {
    return await this.events.updateEvent(id, type.split(SPLIT_SEP), eventDto);
  }

  // New Search Endpoints using Azure Cosmos DB 4.5.1+ Features

  @Post('search/vector')
  async vectorSearch(@Body() searchDto: VectorSearchDTO) {
    this.logger.log('Performing vector search on events');
    try {
      return await this.events.vectorSearch(searchDto);
    } catch (error) {
      this.logger.error(`Vector search failed: ${error.message}`);
      throw new HttpException('Vector search failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('search/text')
  async fullTextSearch(@Body() searchDto: FullTextSearchDTO) {
    this.logger.log(`Performing full-text search for: "${searchDto.searchText}"`);
    try {
      return await this.events.fullTextSearch(searchDto);
    } catch (error) {
      this.logger.error(`Full-text search failed: ${error.message}`);
      throw new HttpException('Full-text search failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('search/hybrid')
  async hybridSearch(@Body() searchDto: HybridSearchDTO) {
    this.logger.log('Performing hybrid search (vector + full-text)');
    try {
      return await this.events.hybridSearch(searchDto);
    } catch (error) {
      this.logger.error(`Hybrid search failed: ${error.message}`);
      throw new HttpException('Hybrid search failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('search/metadata')
  async searchByMetadata(
    @Query('category') category?: string,
    @Query('tags') tagsQuery?: string,
    @Query('priority') priority?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
  ) {
    const tags = tagsQuery ? tagsQuery.split(',').map(tag => tag.trim()) : undefined;
    this.logger.log(`Searching by metadata - category: ${category}, tags: ${tags?.join(', ')}, priority: ${priority}, status: ${status}`);
    
    try {
      return await this.events.searchByMetadata(category, tags, priority, status, limit || 20);
    } catch (error) {
      this.logger.error(`Metadata search failed: ${error.message}`);
      throw new HttpException('Metadata search failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
