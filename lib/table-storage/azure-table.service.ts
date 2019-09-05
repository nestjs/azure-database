import { Injectable, Logger } from '@nestjs/common';
import azure = require('azure-storage');
import { AZURE_TABLE_ENTITY_ATTR } from './azure-table.decorators';
const logger = new Logger('AzureTableStorageService');
enum LogLevel {
  SILENT = 0,
  VERBOSE = 1,
  DEBUG = 2,
}

const CURRENT_LOG = LogLevel.DEBUG;
const SHOW_ERROR_STACKTRACE = true;

@Injectable()
export class AzureTableStorageService implements azure.TableService {
  defaultPayloadFormat: string;
  private tableService: azure.TableService;
  get tableServiceInstance() {
    if (this.tableService) {
      this.debug(`TableService instance found.`);
      return this.tableService;
    }
    this.debug(`TableService new instance.`);
    this.tableService = azure.createTableService();
    return this.tableService;
  }
  constructor() {}
  get queryInstance() {
    return new azure.TableQuery();
  }

  static get entity() {
    return azure.TableUtilities.entityGenerator;
  }

  private debug(message: string, level: LogLevel = CURRENT_LOG) {
    switch (level) {
      case LogLevel.SILENT:
        return;
      case LogLevel.VERBOSE:
        return logger.log(message);
      case LogLevel.DEBUG:
        return logger.log(message);
    }
  }
  private printError(error: Error) {
    logger.error(
      error.message.split('\n').shift(),
      SHOW_ERROR_STACKTRACE && error.stack,
    );
  }

  // azure.TableService Implementation

  withFilter(newFilter: azure.common.filters.IFilter): azure.TableService {
    throw new Error('Method not implemented.');
  }
  getServiceStats(
    options: azure.common.RequestOptions,
    callback: azure.ErrorOrResult<azure.common.models.ServiceStats>,
  ): void;
  getServiceStats(
    callback: azure.ErrorOrResult<azure.common.models.ServiceStats>,
  ): void;
  getServiceStats(options: any, callback?: any) {
    throw new Error('Method not implemented.');
  }
  getServiceProperties(
    options: azure.common.RequestOptions,
    callback: azure.ErrorOrResult<
      azure.common.models.ServicePropertiesResult.ServiceProperties
    >,
  ): void;
  getServiceProperties(
    callback: azure.ErrorOrResult<
      azure.common.models.ServicePropertiesResult.ServiceProperties
    >,
  ): void;
  getServiceProperties(options: any, callback?: any) {
    throw new Error('Method not implemented.');
  }
  setServiceProperties(
    serviceProperties: azure.common.models.ServicePropertiesResult.ServiceProperties,
    options: azure.common.RequestOptions,
    callback: azure.ErrorOrResponse,
  ): void;
  setServiceProperties(
    serviceProperties: azure.common.models.ServicePropertiesResult.ServiceProperties,
    callback: azure.ErrorOrResponse,
  ): void;
  setServiceProperties(serviceProperties: any, options: any, callback?: any) {
    throw new Error('Method not implemented.');
  }
  listTablesSegmented(
    currentToken: azure.TableService.ListTablesContinuationToken,
    options: azure.TableService.ListTablesRequestOptions,
    callback: azure.ErrorOrResult<azure.TableService.ListTablesResponse>,
  ): void;
  listTablesSegmented(
    currentToken: azure.TableService.ListTablesContinuationToken,
    callback: azure.ErrorOrResult<azure.TableService.ListTablesResponse>,
  ): void;
  listTablesSegmented(currentToken: any, options: any, callback?: any) {
    throw new Error('Method not implemented.');
  }
  listTablesSegmentedWithPrefix(
    prefix: string,
    currentToken: azure.TableService.ListTablesContinuationToken,
    options: azure.TableService.ListTablesRequestOptions,
    callback: azure.ErrorOrResult<azure.TableService.ListTablesResponse>,
  ): void;
  listTablesSegmentedWithPrefix(
    prefix: string,
    currentToken: azure.TableService.ListTablesContinuationToken,
    callback: azure.ErrorOrResult<azure.TableService.ListTablesResponse>,
  ): void;
  listTablesSegmentedWithPrefix(
    prefix: any,
    currentToken: any,
    options: any,
    callback?: any,
  ) {
    throw new Error('Method not implemented.');
  }
  getTableAcl(
    table: string,
    options: azure.common.RequestOptions,
    callback: azure.ErrorOrResult<azure.TableService.GetTableAclResult>,
  ): void;
  getTableAcl(
    table: string,
    callback: azure.ErrorOrResult<azure.TableService.GetTableAclResult>,
  ): void;
  getTableAcl(table: any, options: any, callback?: any) {
    throw new Error('Method not implemented.');
  }
  setTableAcl(
    table: string,
    signedIdentifiers: { [key: string]: azure.common.AccessPolicy },
    options: azure.common.RequestOptions,
    callback: azure.ErrorOrResult<{
      TableName: string;
      signedIdentifiers: { [key: string]: azure.common.AccessPolicy };
    }>,
  ): void;
  setTableAcl(
    table: string,
    signedIdentifiers: { [key: string]: azure.common.AccessPolicy },
    callback: azure.ErrorOrResult<{
      TableName: string;
      signedIdentifiers: { [key: string]: azure.common.AccessPolicy };
    }>,
  ): void;
  setTableAcl(
    table: any,
    signedIdentifiers: any,
    options: any,
    callback?: any,
  ) {
    throw new Error('Method not implemented.');
  }
  generateSharedAccessSignature(
    table: string,
    sharedAccessPolicy: azure.TableService.TableSharedAccessPolicy,
  ): string {
    throw new Error('Method not implemented.');
  }
  generateSharedAccessSignatureWithVersion(
    table: string,
    sharedAccessPolicy: azure.TableService.TableSharedAccessPolicy,
    sasVersion: string,
  ): string {
    throw new Error('Method not implemented.');
  }
  doesTableExist(
    table: string,
    options: azure.common.RequestOptions,
    callback: azure.ErrorOrResult<azure.TableService.TableResult>,
  ): void;
  doesTableExist(
    table: string,
    callback: azure.ErrorOrResult<azure.TableService.TableResult>,
  ): void;
  doesTableExist(table: any, options: any, callback?: any) {
    throw new Error('Method not implemented.');
  }
  createTable(
    table: string,
    options: azure.common.RequestOptions,
    callback: azure.ErrorOrResult<azure.TableService.TableResult>,
  ): void;
  createTable(
    table: string,
    callback: azure.ErrorOrResult<azure.TableService.TableResult>,
  ): void;
  createTable(table: any, options: any, callback?: any) {
    throw new Error('Method not implemented.');
  }
  createTableIfNotExists(
    table: string,
  ): Promise<azure.TableService.TableResult> {
    return new Promise((resolve, reject) => {
      this.tableServiceInstance.createTableIfNotExists(
        table,
        (error: Error, result: azure.TableService.TableResult) => {
          if (error) {
            this.printError(error);
          }

          this.debug(
            `Table ${result.TableName} ${
              result.isSuccessful ? 'exists' : 'not exist'
            }`,
          );
          resolve(result);
        },
      );
    });
  }
  deleteTable(
    table: string,
    options: azure.common.RequestOptions,
    callback: azure.ErrorOrResponse,
  ): void;
  deleteTable(table: string, callback: azure.ErrorOrResponse): void;
  deleteTable(table: any, options: any, callback?: any) {
    throw new Error('Method not implemented.');
  }
  deleteTableIfExists(
    table: string,
    options: azure.common.RequestOptions,
    callback: azure.ErrorOrResult<boolean>,
  ): void;
  deleteTableIfExists(
    table: string,
    callback: azure.ErrorOrResult<boolean>,
  ): void;
  deleteTableIfExists(table: any, options: any, callback?: any) {
    throw new Error('Method not implemented.');
  }

  queryEntities<Entity>(
    table: string,
    tableQuery: azure.TableQuery,
    currentToken: azure.TableService.TableContinuationToken,
  ): Promise<azure.TableService.QueryEntitiesResult<Entity>> {
    return new Promise((resolve, reject) => {
      this.tableServiceInstance.queryEntities<Entity>(
        table,
        tableQuery,
        currentToken,
        (error, result: azure.TableService.QueryEntitiesResult<Entity>) => {
          if (error) {
            // this.debug(error.message);

            // reject();
            this.printError(error);
          }

          resolve(result);
        },
      );
    });
  }
  retrieveEntity<T>(
    table: string,
    partitionKey: string,
    rowKey: string,
    options: azure.TableService.TableEntityRequestOptions,
    callback: azure.ErrorOrResult<T>,
  ): void;
  retrieveEntity<T>(
    table: string,
    partitionKey: string,
    rowKey: string,
    callback: azure.ErrorOrResult<T>,
  ): void;
  retrieveEntity(
    table: any,
    partitionKey: any,
    rowKey: any,
    options: any,
    callback?: any,
  ) {
    throw new Error('Method not implemented.');
  }
  insertEntity<T>(table: string, entityDescriptor: T): Promise<T> {
    return new Promise((resolve, reject) => {
      logger.log(entityDescriptor as any);
      logger.log(
        Reflect.getMetadata(
          AZURE_TABLE_ENTITY_ATTR,
          (entityDescriptor as any).name,
        ),
      );

      this.tableServiceInstance.insertEntity(
        table,
        entityDescriptor,
        (error, result: azure.TableService.EntityMetadata) => {
          if (error) {
            this.printError(error);
            reject();
          }

          resolve(result as any);
        },
      );
    });
  }

  insertOrReplaceEntity<T>(
    table: string,
    entityDescriptor: T,
    options: azure.common.RequestOptions,
    callback: azure.ErrorOrResult<azure.TableService.EntityMetadata>,
  ): void;
  insertOrReplaceEntity<T>(
    table: string,
    entityDescriptor: T,
    callback: azure.ErrorOrResult<azure.TableService.EntityMetadata>,
  ): void;
  insertOrReplaceEntity(
    table: any,
    entityDescriptor: any,
    options: any,
    callback?: any,
  ) {
    throw new Error('Method not implemented.');
  }
  replaceEntity<T>(
    table: string,
    entityDescriptor: T,
    options: azure.common.RequestOptions,
    callback: azure.ErrorOrResult<azure.TableService.EntityMetadata>,
  ): void;
  replaceEntity<T>(
    table: string,
    entityDescriptor: T,
    callback: azure.ErrorOrResult<azure.TableService.EntityMetadata>,
  ): void;
  replaceEntity(
    table: any,
    entityDescriptor: any,
    options: any,
    callback?: any,
  ) {
    throw new Error('Method not implemented.');
  }
  mergeEntity<T>(
    table: string,
    entityDescriptor: T,
    options: azure.common.RequestOptions,
    callback: azure.ErrorOrResult<azure.TableService.EntityMetadata>,
  ): void;
  mergeEntity<T>(
    table: string,
    entityDescriptor: T,
    callback: azure.ErrorOrResult<azure.TableService.EntityMetadata>,
  ): void;
  mergeEntity(table: any, entityDescriptor: any, options: any, callback?: any) {
    throw new Error('Method not implemented.');
  }
  insertOrMergeEntity<T>(
    table: string,
    entityDescriptor: T,
    options: azure.common.RequestOptions,
    callback: azure.ErrorOrResult<azure.TableService.EntityMetadata>,
  ): void;
  insertOrMergeEntity<T>(
    table: string,
    entityDescriptor: T,
    callback: azure.ErrorOrResult<azure.TableService.EntityMetadata>,
  ): void;
  insertOrMergeEntity(
    table: any,
    entityDescriptor: any,
    options: any,
    callback?: any,
  ) {
    throw new Error('Method not implemented.');
  }
  deleteEntity<T>(
    table: string,
    entityDescriptor: T,
    options: azure.common.RequestOptions,
    callback: azure.ErrorOrResponse,
  ): void;
  deleteEntity<T>(
    table: string,
    entityDescriptor: T,
    callback: azure.ErrorOrResponse,
  ): void;
  deleteEntity(
    table: any,
    entityDescriptor: any,
    options: any,
    callback?: any,
  ) {
    throw new Error('Method not implemented.');
  }
  executeBatch(
    table: string,
    batch: azure.TableBatch,
    options: azure.TableService.TableEntityRequestOptions,
    callback: azure.ErrorOrResult<azure.TableService.BatchResult[]>,
  ): void;
  executeBatch(
    table: string,
    batch: azure.TableBatch,
    callback: azure.ErrorOrResult<azure.TableService.BatchResult[]>,
  ): void;
  executeBatch(table: any, batch: any, options: any, callback?: any) {
    throw new Error('Method not implemented.');
  }
  defaultLocationMode: azure.StorageUtilities.LocationMode;
  defaultMaximumExecutionTimeInMs: number;
  defaultTimeoutIntervalInMs: number;
  defaultClientRequestTimeoutInMs: number;
  useNagleAlgorithm: boolean;
  enableGlobalHttpAgent: boolean;
  proxy: azure.common.services.storageserviceclient.Proxy;
  logger: azure.Logger;
  setProxy(proxy: azure.common.services.storageserviceclient.Proxy): void {
    throw new Error('Method not implemented.');
  }
  addListener(
    event: string | symbol,
    listener: (...args: any[]) => void,
  ): this {
    throw new Error('Method not implemented.');
  }
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    throw new Error('Method not implemented.');
  }
  once(event: string | symbol, listener: (...args: any[]) => void): this {
    throw new Error('Method not implemented.');
  }
  prependListener(
    event: string | symbol,
    listener: (...args: any[]) => void,
  ): this {
    throw new Error('Method not implemented.');
  }
  prependOnceListener(
    event: string | symbol,
    listener: (...args: any[]) => void,
  ): this {
    throw new Error('Method not implemented.');
  }
  removeListener(
    event: string | symbol,
    listener: (...args: any[]) => void,
  ): this {
    throw new Error('Method not implemented.');
  }
  off(event: string | symbol, listener: (...args: any[]) => void): this {
    throw new Error('Method not implemented.');
  }
  removeAllListeners(event?: string | symbol): this {
    throw new Error('Method not implemented.');
  }
  setMaxListeners(n: number): this {
    throw new Error('Method not implemented.');
  }
  getMaxListeners(): number {
    throw new Error('Method not implemented.');
  }
  listeners(event: string | symbol): Function[] {
    throw new Error('Method not implemented.');
  }
  rawListeners(event: string | symbol): Function[] {
    throw new Error('Method not implemented.');
  }
  emit(event: string | symbol, ...args: any[]): boolean {
    throw new Error('Method not implemented.');
  }
  eventNames(): (string | symbol)[] {
    throw new Error('Method not implemented.');
  }
  listenerCount(type: string | symbol): number {
    throw new Error('Method not implemented.');
  }

  getUrl(table: string, sasToken: string, primary: boolean): string {
    throw new Error('Method not implemented.');
  }
}
