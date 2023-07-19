import { Point } from '@nestjs/azure-database';

export class EventDTO {
  id?: string;
  name: string;
  type: string;
  createdAt: Date;
  location: Point;
}
