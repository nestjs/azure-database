import { Inject, Injectable, Logger } from '@nestjs/common';
import { AZURE_TABLE_STORAGE_NAME } from './azure-table.constant';
import { AzureTableStorageResponse } from './azure-table.interface';
import { AzureEntityMapper } from './azure-table.mapper';
import { AzureTableStorageService } from './azure-table.service';
import azure = require('azure-storage');

const logger = new Logger(`AzureStorageRepository`);

export interface AzureTableStorageResultList<T> extends azure.TableService.QueryEntitiesResult<T> {}

@Injectable()
export class AzureTableStorageRepository<T> {
  constructor(
    private readonly manager: AzureTableStorageService,
    @Inject(AZURE_TABLE_STORAGE_NAME) private readonly tableName,
  ) {}
  async findAll(
    tableQuery?: azure.TableQuery,
    currentToken?: azure.TableService.TableContinuationToken,
  ): Promise<AzureTableStorageResultList<T>> {
    const result = await this.manager.queryEntities<azure.TableService.EntityMetadata>(
      this.tableName,
      tableQuery,
      currentToken,
    );
    const numberOfEntities = (result.entries || []).length;

    if (numberOfEntities <= 0) {
      logger.debug(`No Entities found in table ${this.tableName}`);
    } else {
      if (numberOfEntities === 1) {
        logger.debug(`Found 1 Entity in table ${this.tableName}`);
      } else {
        logger.debug(`Found ${numberOfEntities} Entities in table ${this.tableName}`);
      }
    }

    return {
      ...result,
      entries: AzureEntityMapper.serializeAll<T>(result.entries),
    };
  }
  async find(rowKey: string, entity: Partial<T>) {
    logger.debug(`Looking for Entity RowKey=${rowKey} in ${this.tableName}`);

    const partitionKey = AzureEntityMapper.createEntity(entity, rowKey).PartitionKey._;
    const result = await this.manager.retrieveEntity<azure.TableService.EntityMetadata>(
      this.tableName,
      partitionKey,
      rowKey,
    );

    console.table(result, ['(index)', '$', '_']);
    return AzureEntityMapper.serialize<T>(result);
  }

  async create(entity: T) {
    logger.debug(`Inserting Entity in ${this.tableName}:`);

    entity = AzureEntityMapper.createEntity<T>(entity);
    // tslint:disable-next-line: no-console
    console.table(entity);

    const result = await this.manager.insertEntity<T>(this.tableName, entity);

    logger.debug(`Entity stored successfuly`);
    console.table(result, ['(index)', '$', '_']);
    return AzureEntityMapper.serialize<T>(result);
  }

  async update(rowKey: string, entity: Partial<T>): Promise<T> {
    logger.debug(`Inserting Entity in ${this.tableName}:`);

    entity = AzureEntityMapper.createEntity<T>(entity, rowKey);

    const result = await this.manager.replaceEntity(this.tableName, entity);

    logger.debug(`Entity updated successfuly`);
    // tslint:disable-next-line: no-console
    console.table(entity);
    return AzureEntityMapper.serialize<T>(result);
  }

  async delete(rowKey: string, entity: T): Promise<AzureTableStorageResponse> {
    entity = AzureEntityMapper.createEntity<T>(entity, rowKey);
    const result = await this.manager.deleteEntity<T>(this.tableName, entity);

    logger.debug(`Deleted Entity RowKey=${rowKey} in ${this.tableName} (${result.isSuccessful})`);
    console.table(result, ['(index)', '$', '_']);
    return result;
  }
}
