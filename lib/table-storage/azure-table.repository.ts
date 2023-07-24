import { DeleteTableEntityResponse } from '@azure/data-tables';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AZURE_TABLE_STORAGE_FEATURE_OPTIONS, AZURE_TABLE_STORAGE_NAME } from './azure-table.constant';
import { AzureTableStorageFeatureOptions } from './azure-table.interface';
import { AzureEntityMapper } from './azure-table.mapper';
import { AzureTableStorageService } from './azure-table.service';

const logger = new Logger(`AzureStorageRepository`);

type PartitionRowKeyValuePair = {
  partitionKey: string;
  rowKey: string;
};

@Injectable()
export class AzureTableStorageRepository<T> {
  constructor(
    private readonly manager: AzureTableStorageService,
    @Inject(AZURE_TABLE_STORAGE_NAME) private readonly tableName: string,
    @Inject(AZURE_TABLE_STORAGE_FEATURE_OPTIONS) private readonly options: AzureTableStorageFeatureOptions,
  ) {}

  get tableServiceClientInstance() {
    return this.manager.tableServiceClientInstance;
  }

  get tableClientInstance() {
    return this.manager.tableClientInstance;
  }

  async createTableIfNotExists(tableName?: string) {
    logger.debug(`Create Table ${tableName} (if not exists)`);
    await this.tableServiceClientInstance.createTable(tableName);
  }

  async find(entity: Partial<T>): Promise<T> {
    logger.debug(`Looking for Entity in ${this.tableName}`);

    const { partitionKey, rowKey } = AzureEntityMapper.createEntity(entity);
    const result = await this.manager.tableClientInstance.getEntity(partitionKey.value, rowKey.value);

    console.table(result, ['(index)', 'value', 'type']);
    const mappedEntity = AzureEntityMapper.serialize<T>(result);
    return Object.entries(mappedEntity).length === 0 ? null : mappedEntity;
  }

  async create(entity: T): Promise<T | null> {
    if (this.options.createTableIfNotExists) {
      await this.createTableIfNotExists(this.tableName);
    }

    logger.debug(`Creating Entity in ${this.tableName}:`);

    // entity = AzureEntityMapper.createEntity<T>(entity);

    try {
      logger.debug({entity});

      const result = await this.manager.tableClientInstance.createEntity(entity as PartitionRowKeyValuePair);
      logger.debug(`Entity stored successfully`);
      return AzureEntityMapper.serialize<T>(result);
    } catch (error) {
      // TODO: figure out how to parse odata errors
      if (error.message.startsWith('{')) {
        return this.handleRestErrors(error);
      }

      throw error;
    }
  }

  async update(entity: T): Promise<T> {
    logger.debug(`Inserting Entity in ${this.tableName}:`);

    entity = AzureEntityMapper.createEntity(entity);
    const result = await this.manager.tableClientInstance.updateEntity(entity as PartitionRowKeyValuePair, 'Replace');

    logger.debug(`Entity updated successfully`);
    return AzureEntityMapper.serialize<T>(result);
  }

  async delete(entity: T): Promise<DeleteTableEntityResponse> {
    const { partitionKey, rowKey } = AzureEntityMapper.createEntity(entity);
    const result = await this.manager.tableClientInstance.deleteEntity(partitionKey.value, rowKey.value);

    logger.debug(`Deleted Entity RowKey=${rowKey} in ${this.tableName}`);
    console.table(result, ['(index)', 'value', 'type']);
    return result;
  }

  private handleRestErrors(error: Error) {
    const err = JSON.parse(error.message);

    if (err['odata.error'].code === 'TableNotFound') {
      logger.error(`Error creating entity. Table ${this.tableName} Not Found. Is it created?`);
    } else if (err['odata.error'].code === 'InvalidInput') {
      logger.error(`Error creating entity:`);
      err['odata.error'].message.value.split('\n').forEach((line: string) => {
        logger.error(line);
      });
    } else {
      logger.error(`Error creating entity: ${error}`);
    }
    return null;
  }
}
