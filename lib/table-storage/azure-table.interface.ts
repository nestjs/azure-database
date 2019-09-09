import azure = require('azure-storage');

export interface AzureTableStorageOptions {
  accountName?: string;
  sasKey?: string;
  connectionString?: string;
}

export interface AzureTableStorageResponse extends azure.ServiceResponse {}

export interface AzureTableStorageQuery extends azure.TableQuery {}

export interface AzureTableContinuationToken extends azure.TableService.TableContinuationToken {}
