import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { EventDTO } from './event.dto';
import { Event } from './event.entity';
import { EventService } from './event.service';

@Controller('event')
export class EventController {
  constructor(private readonly events: EventService) {}

  @Get(':partitionKey/:rowKey')
  async getEvent(
    @Param('partitionKey') partitionKey: string,
    @Param('rowKey') rowKey: string,
  ) {
    return await this.events.find(partitionKey, rowKey);
  }

  @Get()
  async getEvents() {
    return await this.events.findAll();
  }

  @Post()
  async createEvent(@Body() eventDto: EventDTO) {
    const event = new Event();
    Object.assign(event, eventDto);

    return await this.events.create(event);
  }

  @Put(':partitionKey/:rowKey')
  async updateEvent(
    @Param('partitionKey') partitionKey: string,
    @Param('rowKey') rowKey: string,
    @Body() eventDto: EventDTO,
  ) {
    const event = new Event();
    Object.assign(event, eventDto);

    return await this.events.update(partitionKey, rowKey, event);
  }

  @Delete(':partitionKey/:rowKey')
  async deleteDelete(
    @Param('partitionKey') partitionKey: string,
    @Param('rowKey') rowKey: string,
  ) {
    return await this.events.delete(partitionKey, rowKey);
  }
}
