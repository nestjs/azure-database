import { generateUuid } from '@azure/ms-rest-js';
import { Logger } from '@nestjs/common';
import { AZURE_TABLE_ENTITY } from './azure-table.decorators';
import azure = require('azure-storage');

const logger = new Logger(`AzureEntityMapper`);

export interface PartitionRowKeyValues {
  RowKey: {
    _: string;
    $: string;
  };
  PartitionKey: {
    _: string;
    $: string;
  };
}

export class AzureEntityMapper {
  static serializeAll<E>(entriesDescriptor: azure.TableService.EntityMetadata[]): E[] {
    return entriesDescriptor.map<E>((entry) => {
      return AzureEntityMapper.serialize<E>(entry);
    });
  }
  static serialize<E>(entryDescriptor: azure.TableService.EntityMetadata) {
    const result = {} as E;

    for (const key in entryDescriptor) {
      if (key !== '.metadata') {
        result[key] = entryDescriptor[key]._;
      }
    }

    return result;
  }
  static createEntity<D>(partialDto: Partial<AzureEntityMapper>, rowKeyValue = generateUuid()) {
    // Note: make sure we are getting the metatadat from the DTO constructor
    // See: src/table-storage/azure-table.repository.ts
    const entityDescriptor = Reflect.getMetadata(AZURE_TABLE_ENTITY, partialDto.constructor) as PartitionRowKeyValues;
    const entity: PartitionRowKeyValues = {
      ...entityDescriptor,
    };

    for (const key in partialDto) {
      if (entityDescriptor[key]) {
        entity[key] = { _: partialDto[key], $: entityDescriptor[key].$ };
      }
    }

    entity.RowKey._ = rowKeyValue;

    logger.debug(`Mapped Entity from DTO:`);
    logger.debug(`- PartitionKey=${entityDescriptor.PartitionKey._}`);
    logger.debug(`- RowKey=${rowKeyValue}`);

    return entity as D & PartitionRowKeyValues;
  }
}
