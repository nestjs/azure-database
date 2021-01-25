import {
  EntityPartitionKey,
  EntityRowKey,
  EntityString,
} from '@nestjs/azure-database';

@EntityPartitionKey('ContactID')
@EntityRowKey('ContactName')
export class Contact {
  @EntityString()
  name: string;

  @EntityString()
  message: string;
}
