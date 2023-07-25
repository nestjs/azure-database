import { CosmosDateTime, CosmosPartitionKey } from '@nestjs/azure-database';

@CosmosPartitionKey('type')
export class Event {
  id?: string;
  name: string;
  type: string;
  @CosmosDateTime() createdAt: Date;
}
