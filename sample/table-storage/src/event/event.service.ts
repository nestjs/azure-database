import { InjectRepository, Repository } from '@nestjs/azure-database';
import { Injectable } from '@nestjs/common';
import { Event } from './event.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(event: Event): Promise<Event> {
    return await this.eventRepository.create(event);
  }
}
