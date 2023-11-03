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

@Controller('event')
export class EventController {
  constructor(private readonly events: EventService) {}

  @Get()
  async getEvents() {
    return await this.events.getEvents();
  }

  @Get(':type/:id')
  async getEvent(@Param('id') id: string, @Param('type') type: string) {
    const event = await this.events.getEvent(id, type);
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
    return await this.events.deleteEvent(id, type);
  }

  @Put(':type/:id')
  async updateEvent(
    @Param('id') id: string,
    @Param('type') type: string,
    @Body() eventDto: EventDTO,
  ) {
    return await this.events.updateEvent(id, type, eventDto);
  }
}
