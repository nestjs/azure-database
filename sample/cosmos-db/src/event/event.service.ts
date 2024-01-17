import { InjectModel } from '@nestjs/azure-database';
import type { Container } from '@azure/cosmos';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { EventDTO } from './event.dto';
import { Event } from './event.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event)
    private readonly eventContainer: Container,
  ) {}

  async create(eventDto: EventDTO): Promise<Event> {
    if (!eventDto.id) {
      eventDto.id = Date.now().toString();
    }
    const { resource } = await this.eventContainer.items.create<Event>(
      eventDto,
    );
    return resource;
  }

  async getEvents(): Promise<Event[]> {
    try {
      const querySpec = {
        query: 'SELECT * FROM events',
      };
      const { resources } = await this.eventContainer.items
        .query<Event>(querySpec)
        .fetchAll();
      return resources;
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  async getEvent(id: string, type: string | string[]): Promise<Event> {
    try {
      const { resource } = await this.eventContainer
        .item(id, type)
        .read<Event>();

      return resource;
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  async updateEvent(
    id: string,
    type: string | string[],
    eventData: EventDTO,
  ): Promise<Event> {
    try {
      let { resource: item } = await this.eventContainer
        .item(id, type)
        .read<Event>();

      item = {
        ...item,
        ...eventData,
      };

      const { resource: replaced } = await this.eventContainer
        .item(id, type)
        .replace(item);

      return replaced;
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  async deleteEvent(id: string, type: string | string[]): Promise<Event> {
    try {
      const { resource: deleted } = await this.eventContainer
        .item(id, type)
        .delete<Event>();

      return deleted;
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }
}
