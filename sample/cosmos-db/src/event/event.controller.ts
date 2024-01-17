import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { EventDTO } from './event.dto';
import { EventService } from './event.service';

const SPLIT_SEP = /[.,|-]+/; // Choose your own separator for the hierarchical partition key

@Controller('event')
export class EventController {
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
}
