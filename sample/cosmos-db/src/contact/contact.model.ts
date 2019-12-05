import {
  CosmosPartitionKey,
  CosmosDateTime,
  CosmosUniqueKey,
  Point,
} from '@nestjs/azure-database';

@CosmosPartitionKey('type')
export class Contact {
  id?: string;

  firstName: string;

  lastNale: string;

  location: Point;

  type: string;

  @CosmosUniqueKey() phoneNumber: string;

  @CosmosDateTime() createdAt?: Date;

  @CosmosDateTime() updatedAt?: Date;
}
