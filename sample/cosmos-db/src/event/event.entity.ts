import {
  CosmosPartitionKey,
  CosmosDateTime,
  Point,
} from '@nestjs/azure-database';

@CosmosPartitionKey('type')
export class Event {
  id?: string;
  type: string;
  @CosmosDateTime() createdAt: Date;
  location: Point;
}
