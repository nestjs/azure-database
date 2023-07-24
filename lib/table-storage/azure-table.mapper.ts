import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';
import { AZURE_TABLE_ENTITY } from './azure-table.decorators';

const logger = new Logger(`AzureEntityMapper`);

export interface PartitionRowKeyValues {
  partitionKey: string;
  rowKey: string;
}

export class AzureEntityMapper {
  static serializeAll<E>(entriesDescriptor: any[]): E[] {
    return entriesDescriptor.map<E>(entry => {
      return AzureEntityMapper.serialize<E>(entry);
    });
  }
  static serialize<E>(entryDescriptor: any) {
    const result = {} as E;

    for (const key in entryDescriptor) {
      if (key !== 'odata.metadata' && key !== 'etag') {
        result[key] = entryDescriptor[key];
      }
    }

    return result;
  }
  static createEntity<D>(partialDto: Partial<AzureEntityMapper>) {
    // Note: make sure we are getting the metadata from the DTO constructor
    // See: src/table-storage/azure-table.repository.ts
    const entityDescriptor = Reflect.getMetadata(AZURE_TABLE_ENTITY, partialDto.constructor) as PartitionRowKeyValues;

    if (typeof entityDescriptor === 'undefined') {
      throw new Error(
        `Could not extract metadata from ${partialDto.constructor.name}. Make sure you are passing a valid Entity`,
      );
    }

    const entity: PartitionRowKeyValues = {
      ...entityDescriptor,
    };

    for (const key in partialDto) {
      if (entityDescriptor[key]) {
        entity[key] = partialDto[key];
      }
    }

    if (!entity.rowKey) {
      entity.rowKey = randomUUID() as string;
    }

    return entity as D & PartitionRowKeyValues;
  }
}
