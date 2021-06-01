import { Injectable, Logger } from '@nestjs/common';
import azure = require('azure-storage');
const logger = new Logger('AzureTableStorage');

const SHOW_ERROR_STACKTRACE = true;

@Injectable()
export class AzureTableStorageService implements azure.TableService {
  host: azure.StorageHost;
  defaultPayloadFormat: string;
  private tableService: azure.TableService;
  get tableServiceInstance() {
    if (this.tableService) {
      return this.tableService;
    }
    logger.debug(`Create new TableService instance`);
    this.tableService = azure.createTableService();
    return this.tableService;
  }
  get queryInstance() {
    return new azure.TableQuery();
  }

  private printError(error: Error) {
    logger.error(error.message.split('\n').shift(), SHOW_ERROR_STACKTRACE && error.stack);
  }

  // azure.TableService Implementation

  withFilter(newFilter: azure.common.filters.IFilter): azure.TableService {
    throw new Error('Method not implemented.');
  }
  getServiceStats(options?: any): Promise<azure.common.models.ServiceStats> {
    return new Promise((resolve, reject) => {
      this.tableServiceInstance.getServiceStats(options, (error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
    });
  }
  getServiceProperties(
    options: azure.common.RequestOptions,
    callback: azure.ErrorOrResult<azure.common.models.ServicePropertiesResult.ServiceProperties>,
  ): void;
  getServiceProperties(
    callback: azure.ErrorOrResult<azure.common.models.ServicePropertiesResult.ServiceProperties>,
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
  listTablesSegmentedWithPrefix(prefix: any, currentToken: any, options: any, callback?: any) {
    throw new Error('Method not implemented.');
  }
  getTableAcl(
    table: string,
    options: azure.common.RequestOptions,
    callback: azure.ErrorOrResult<azure.TableService.GetTableAclResult>,
  ): void;
  getTableAcl(table: string, callback: azure.ErrorOrResult<azure.TableService.GetTableAclResult>): void;
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
  setTableAcl(table: any, signedIdentifiers: any, options: any, callback?: any) {
    throw new Error('Method not implemented.');
  }
  generateSharedAccessSignature(table: string, sharedAccessPolicy: azure.TableService.TableSharedAccessPolicy): string {
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
  doesTableExist(table: string, callback: azure.ErrorOrResult<azure.TableService.TableResult>): void;
  doesTableExist(table: any, options: any, callback?: any) {
    throw new Error('Method not implemented.');
  }
  createTable(
    table: string,
    options: azure.common.RequestOptions,
    callback: azure.ErrorOrResult<azure.TableService.TableResult>,
  ): void;
  createTable(table: string, callback: azure.ErrorOrResult<azure.TableService.TableResult>): void;
  createTable(table: any, options: any, callback?: any) {
    throw new Error('Method not implemented.');
  }
  createTableIfNotExists(table: string): Promise<azure.TableService.TableResult> {
    return new Promise((resolve, reject) => {
      this.tableServiceInstance.createTableIfNotExists(
        table,
        (error: Error, result: azure.TableService.TableResult) => {
          if (error) {
            logger.debug(`Table ${result.TableName} exists`);

            // @Todo: handle different edge cases
            // The specified table is being deleted. Try operation later.
            // {"isSuccessful":false,"statusCode":409}

            reject(error);
          }

          if (result.statusCode === 204) {
            // {"isSuccessful":true,"statusCode":204,"TableName":"Contacts","created":true}
            logger.debug(`Table ${result.TableName} created`);
          } else if (result.statusCode === 200) {
            // {"isSuccessful":true,"statusCode":200,"TableName":"Contacts","created":false}
            logger.debug(`Table ${result.TableName} already available`);
          }
          resolve(result);
        },
      );
    });
  }
  deleteTable(table: string, options: azure.common.RequestOptions, callback: azure.ErrorOrResponse): void;
  deleteTable(table: string, callback: azure.ErrorOrResponse): void;
  deleteTable(table: any, options: any, callback?: any) {
    throw new Error('Method not implemented.');
  }
  deleteTableIfExists(
    table: string,
    options: azure.common.RequestOptions,
    callback: azure.ErrorOrResult<boolean>,
  ): void;
  deleteTableIfExists(table: string, callback: azure.ErrorOrResult<boolean>): void;
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
            reject(error);
            this.printError(error);
          }
          resolve(result);
        },
      );
    });
  }
  retrieveEntity<T>(table: string, partitionKey: string, rowKey: string, options?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      this.tableServiceInstance.retrieveEntity<T>(table, partitionKey, rowKey, options, (error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
    });
  }
  insertEntity<T>(table: string, entityDescriptor: T): Promise<azure.TableService.EntityMetadata> {
    return new Promise((resolve, reject) => {
      const returnCreatedEntityOptions = { echoContent: true };

      this.tableServiceInstance.insertEntity(
        table,
        entityDescriptor,
        returnCreatedEntityOptions,
        (error, result: azure.TableService.EntityMetadata) => {
          if (error) {
            this.printError(error);
            reject(error);
          }
          resolve(result);
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
  insertOrReplaceEntity(table: any, entityDescriptor: any, options: any, callback?: any) {
    throw new Error('Method not implemented.');
  }
  replaceEntity<T>(table: string, entityDescriptor: T, options?: any): Promise<azure.TableService.EntityMetadata> {
    return new Promise((resolve, reject) => {
      this.tableServiceInstance.replaceEntity<T>(table, entityDescriptor, options, (error, result) => {
        if (error) {
          this.printError(error);
          reject(error);
        }
        resolve(result);
      });
    });
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
  insertOrMergeEntity(table: any, entityDescriptor: any, options: any, callback?: any) {
    throw new Error('Method not implemented.');
  }
  deleteEntity<T>(table: string, entityDescriptor: Partial<T>, options?: any): Promise<azure.ServiceResponse> {
    return new Promise((resolve, reject) => {
      this.tableServiceInstance.deleteEntity<Partial<T>>(table, entityDescriptor, options, (error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
    });
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
  get defaultLocationMode(): azure.StorageUtilities.LocationMode {
    return this.tableServiceInstance.defaultLocationMode;
  }
  get defaultMaximumExecutionTimeInMs(): number {
    return this.tableServiceInstance.defaultMaximumExecutionTimeInMs;
  }
  get defaultTimeoutIntervalInMs(): number {
    return this.tableServiceInstance.defaultTimeoutIntervalInMs;
  }
  get defaultClientRequestTimeoutInMs(): number {
    return this.tableServiceInstance.defaultClientRequestTimeoutInMs;
  }
  get useNagleAlgorithm(): boolean {
    return this.tableServiceInstance.useNagleAlgorithm;
  }
  get enableGlobalHttpAgent(): boolean {
    return this.tableServiceInstance.enableGlobalHttpAgent;
  }
  get proxy(): azure.common.services.storageserviceclient.Proxy {
    return this.tableServiceInstance.proxy;
  }
  get logger(): azure.Logger {
    return this.tableServiceInstance.logger;
  }
  setProxy(proxy: azure.common.services.storageserviceclient.Proxy): void {
    this.tableServiceInstance.setProxy(proxy);
  }
  addListener(event: string | symbol, listener: (...args: any[]) => void): this {
    this.tableServiceInstance.addListener(event, listener);
    return this;
  }
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    this.tableServiceInstance.on(event, listener);
    return this;
  }
  once(event: string | symbol, listener: (...args: any[]) => void): this {
    this.tableServiceInstance.once(event, listener);
    return this;
  }
  prependListener(event: string | symbol, listener: (...args: any[]) => void): this {
    this.tableServiceInstance.prependListener(event, listener);
    return this;
  }
  prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this {
    this.tableServiceInstance.prependOnceListener(event, listener);
    return this;
  }
  removeListener(event: string | symbol, listener: (...args: any[]) => void): this {
    this.tableServiceInstance.removeListener(event, listener);
    return this;
  }
  off(event: string | symbol, listener: (...args: any[]) => void): this {
    this.tableServiceInstance.off(event, listener);
    return this;
  }
  removeAllListeners(event?: string | symbol): this {
    this.tableServiceInstance.removeAllListeners(event);
    return this;
  }
  setMaxListeners(n: number): this {
    this.tableServiceInstance.setMaxListeners(n);
    return this;
  }
  getMaxListeners(): number {
    return this.tableServiceInstance.getMaxListeners();
  }
  // tslint:disable-next-line: ban-types
  listeners(event: string | symbol): Function[] {
    return this.tableServiceInstance.listeners(event);
  }
  // tslint:disable-next-line: ban-types
  rawListeners(event: string | symbol): Function[] {
    return this.tableServiceInstance.rawListeners(event);
  }
  emit(event: string | symbol, ...args: any[]): boolean {
    return this.tableServiceInstance.emit(event, args);
  }
  eventNames(): Array<string | symbol> {
    return this.tableServiceInstance.eventNames();
  }
  listenerCount(type: string | symbol): number {
    return this.tableServiceInstance.listenerCount(type);
  }

  getUrl(table: string, sasToken: string, primary: boolean): string {
    return this.tableServiceInstance.getUrl(table, sasToken, primary);
  }
}
