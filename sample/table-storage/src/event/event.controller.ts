import {
  Body,
  Controller,
  Post,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EventDTO } from './event.dto';
import { EventService } from './event.service';
import { Event } from './event.entity';

@Controller('event')
export class EventController {
  constructor(private readonly events: EventService) {}

  @Post()
  async createEvent(@Body() eventDto: EventDTO) {
    try {
      const event = new Event();
      Object.assign(event, eventDto);

      return await this.events.create(event);
    } catch (error) {
      console.error(error);
      throw new UnprocessableEntityException(error);
    }
  }
}
