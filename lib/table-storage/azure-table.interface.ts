import azure = require('azure-storage');

export interface AzureTableStorageOptions {
  accountName?: string;
  sasKey?: string;
  connectionString?: string;
}

// tslint:disable-next-line: no-empty-interface
export interface AzureTableStorageResponse extends azure.ServiceResponse {}

// tslint:disable-next-line: no-empty-interface
export interface AzureTableStorageQuery extends azure.TableQuery {}

// tslint:disable-next-line: no-empty-interface
export interface AzureTableContinuationToken extends azure.TableService.TableContinuationToken {}

export interface AzureTableStorageResultList<T> extends azure.TableService.QueryEntitiesResult<T> {}

export interface Repository<T> {
  findAll(
    tableQuery?: AzureTableStorageQuery,
    currentToken?: AzureTableContinuationToken,
  ): Promise<AzureTableStorageResultList<T>>;

  find(rowKey: string, entity: Partial<T>): Promise<T>;

  create(entity: T): Promise<T>;

  update(rowKey: string, entity: Partial<T>): Promise<T>;

  delete(rowKey: string, entity: T): Promise<AzureTableStorageResponse>;
}
