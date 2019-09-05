import azure = require('azure-storage');

export interface AzureTableStorageOptions {
  accountName?: string;
  sasKey?: string;
  connectionString?: string;
}
