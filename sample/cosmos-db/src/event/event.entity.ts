import { CosmosDateTime, CosmosPartitionKey } from '@nestjs/azure-database';
import { PartitionKeyDefinitionVersion, PartitionKeyKind } from '@azure/cosmos';

@CosmosPartitionKey({
  paths: ['/name', '/type/label'],
  version: PartitionKeyDefinitionVersion.V2,
  kind: PartitionKeyKind.MultiHash
})
export class Event {
  id?: string;
  name: string;
  type: {
    label: string;
  }
  @CosmosDateTime() createdAt: Date;
}
