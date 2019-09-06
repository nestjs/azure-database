import azure = require('azure-storage');

export interface AzureTableStorageOptions {
  accountName?: string;
  sasKey?: string;
  connectionString?: string;
}

// tslint:disable-next-line: no-empty-interface
export interface AzureTableStorageResponse extends azure.ServiceResponse {}
