import azure = require('azure-storage');

export interface AzureTableStorageOptions {
  accountName?: string;
  sasKey?: string;
  connectionString?: string;
}

export interface AzureTableStorageFeatureOptions {
  table?: string;
  createTableIfNotExists?: boolean;
}

// tslint:disable-next-line: no-empty-interface
export interface AzureTableStorageResponse extends azure.ServiceResponse {}

// tslint:disable-next-line: no-empty-interface
// export interface AzureTableStorageQuery extends azure.TableQuery {}
export type AzureTableStorageQuery = azure.TableQuery;
// tslint:disable-next-line: no-empty-interface
export interface AzureTableContinuationToken extends azure.TableService.TableContinuationToken {}

export interface AzureTableStorageResultList<T> extends azure.TableService.QueryEntitiesResult<T> {}

export interface Repository<T> {
  select(...args: any[]): Repository<T> & AzureTableStorageQuery;
  top(top: number): Repository<T> & AzureTableStorageQuery;
  where(condition: string, ...args: any[]): Repository<T> & AzureTableStorageQuery;
  and(condition: string, ...args: any[]): Repository<T> & AzureTableStorageQuery;
  or(condition: string, ...args: any[]): Repository<T> & AzureTableStorageQuery;
  toQueryObject(): Object;

  findAll(
    tableQuery?: AzureTableStorageQuery,
    currentToken?: AzureTableContinuationToken,
  ): Promise<AzureTableStorageResultList<T>>;

  find(rowKey: string, entity: Partial<T>): Promise<T>;

  create(entity: T, rowKeyValue?: string): Promise<T>;

  update(rowKey: string, entity: Partial<T>): Promise<T>;

  delete(rowKey: string, entity: T): Promise<AzureTableStorageResponse>;
}

export type ValueType = ((e: any) => string) | string;
