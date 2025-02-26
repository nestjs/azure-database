import { TableClient, TableServiceClient } from '@azure/data-tables';
import { Inject, Injectable } from '@nestjs/common';
import { AZURE_TABLE_STORAGE_MODULE_OPTIONS, AZURE_TABLE_STORAGE_NAME } from './azure-table.constant';
import { AzureTableStorageOptions } from './azure-table.interface';

@Injectable()
export class AzureTableStorageService {
  constructor(
    @Inject(AZURE_TABLE_STORAGE_NAME) private readonly tableName: string,
    @Inject(AZURE_TABLE_STORAGE_MODULE_OPTIONS) private readonly options?: AzureTableStorageOptions,
  ) {}

  private tableServiceClient: TableServiceClient;
  private tableClient: TableClient;

  get tableServiceClientInstance() {
    if (this.tableServiceClient) {
      return this.tableServiceClient;
    }
    this.tableServiceClient = TableServiceClient.fromConnectionString(
      this.options.connectionString || process.env.AZURE_STORAGE_CONNECTION_STRING,
      this.options,
    );
    return this.tableServiceClient;
  }

  get tableClientInstance() {
    // this.options = this.moduleRef.get(AZURE_TABLE_STORAGE_MODULE_OPTIONS)
    console.log('tableClientInstance', this.options);
    if (this.tableClient) {
      return this.tableClient;
    }
    this.tableClient = TableClient.fromConnectionString(
      this.options.connectionString || process.env.AZURE_STORAGE_CONNECTION_STRING,
      this.tableName,
      this.options,
    );
    return this.tableClient;
  }
}
