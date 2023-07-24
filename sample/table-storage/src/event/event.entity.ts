import {
  EntityDateTime,
  EntityPartitionKey,
  EntityRowKey,
  EntityString,
} from '@nestjs/azure-database';

@EntityPartitionKey('id')
@EntityRowKey('type')
export class Event {
  @EntityString() id?: string;
  @EntityString() name: string;
  @EntityString() type: string;
  @EntityDateTime() createdAt: Date;
}
