import { Injectable } from '@nestjs/common';

const azure = require('azure-storage');
interface RequestLocationMode {
  PRIMARY_ONLY: 0;
  SECONDARY_ONLY: 1;
  PRIMARY_OR_SECONDARY: 2;
}
interface AzureTableStorageResult {
  entries: AzureTableStorageEntity[];
}
// tslint:disable-next-line: no-empty-interface
interface AzureTableStorageBatch {}
interface AzureTableStorageQuery {
  where(condition: string, encodingString?: string): AzureTableStorageQuery;
  and(condition: string, encodingString?: string): AzureTableStorageQuery;
  or(condition: string, encodingString?: string): AzureTableStorageQuery;
  select(...properties: string[]): AzureTableStorageQuery;
  top(numberOfItems: number): AzureTableStorageQuery;
}
interface AzureTableStorageEntity {
  PartitionKey: { [key: string]: string };
  RowKey: { [key: string]: string };
  [CustomProperty: string]: { [key: string]: string };
}
interface AzureTableStorageOptions {
  locationMode: RequestLocationMode;
  timeoutIntervalInMs: number;
  clientRequestTimeoutInMs: number;
  maximumExecutionTimeInMs: number;
  clientRequestId: string;
  useNagleAlgorithm: boolean;
  payloadFormat?: string;
  autoResolveProperties?: boolean;
}
interface AzureTableStorageToken {
  nextTableName: string;
  nextPartitionKey: string;
  nextRowKey: string;
}
// tslint:disable-next-line: no-empty-interface
interface AzureTableStorageResult {}
interface AzureTableStorage {
  doesTableExist(
    table: string,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult>;
  listTablesSegmented(
    currentToken: AzureTableStorageToken,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult>;
  listTablesSegmentedWithPrefix(
    currentToken: AzureTableStorageToken,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult>;
  createTable(
    table: string,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult>;
  createTableIfNotExists(
    table: string,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult>;
  deleteTable(
    table: string,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult>;
  deleteTableIfExists(
    table: string,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult>;
  // entities
  queryEntities(
    table: string,
    tableQuery: AzureTableStorageQuery,
    currentToken: AzureTableStorageToken,
  ): Promise<AzureTableStorageResult>;
  retrieveEntity(
    table: string,
    partitionKey: string,
    rowKey: string,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult>;
  insertEntity(
    table: string,
    entityDescriptor: any,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult>;
  insertOrReplaceEntity(
    table: string,
    entityDescriptor: any,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult>;
  replaceEntity(
    table: string,
    entityDescriptor: any,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult>;
  mergeEntity(
    table: string,
    entityDescriptor: any,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult>;
  insertOrMergeEntity(
    table: string,
    entityDescriptor: any,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult>;
  deleteEntity(
    table: string,
    entityDescriptor: any,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult>;
  executeBatch(
    table: string,
    batch: AzureTableStorageBatch,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult>;
  getUrl(table: string, sasToken: string, primary: boolean): string;
}

export interface AzureStorageOptions {
  accountName: string;
  containerName: string;
  sasKey?: string;
}

@Injectable()
export class AzureTableStorageService implements AzureTableStorage {
  doesTableExist(
    table: string,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult> {
    throw new Error('Method not implemented.');
  }
  listTablesSegmented(
    currentToken: AzureTableStorageToken,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult> {
    throw new Error('Method not implemented.');
  }
  listTablesSegmentedWithPrefix(
    currentToken: AzureTableStorageToken,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult> {
    throw new Error('Method not implemented.');
  }
  createTable(
    table: string,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult> {
    throw new Error('Method not implemented.');
  }
  createTableIfNotExists(
    table: string,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult> {
    throw new Error('Method not implemented.');
  }
  deleteTable(
    table: string,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult> {
    throw new Error('Method not implemented.');
  }
  deleteTableIfExists(
    table: string,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult> {
    throw new Error('Method not implemented.');
  }
  queryEntities(
    table: string,
    tableQuery: AzureTableStorageQuery,
    currentToken: AzureTableStorageToken,
  ): Promise<AzureTableStorageResult> {
    throw new Error('Method not implemented.');
  }
  retrieveEntity(
    table: string,
    partitionKey: string,
    rowKey: string,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult> {
    throw new Error('Method not implemented.');
  }
  insertEntity(
    table: string,
    entityDescriptor: any,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult> {
    throw new Error('Method not implemented.');
  }
  insertOrReplaceEntity(
    table: string,
    entityDescriptor: any,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult> {
    throw new Error('Method not implemented.');
  }
  replaceEntity(
    table: string,
    entityDescriptor: any,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult> {
    throw new Error('Method not implemented.');
  }
  mergeEntity(
    table: string,
    entityDescriptor: any,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult> {
    throw new Error('Method not implemented.');
  }
  insertOrMergeEntity(
    table: string,
    entityDescriptor: any,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult> {
    throw new Error('Method not implemented.');
  }
  deleteEntity(
    table: string,
    entityDescriptor: any,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult> {
    throw new Error('Method not implemented.');
  }
  executeBatch(
    table: string,
    batch: AzureTableStorageBatch,
    options?: AzureTableStorageOptions,
  ): Promise<AzureTableStorageResult> {
    throw new Error('Method not implemented.');
  }
  getUrl(table: string, sasToken: string, primary: boolean): string {
    throw new Error('Method not implemented.');
  }
}
