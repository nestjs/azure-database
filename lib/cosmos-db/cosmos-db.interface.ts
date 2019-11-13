import { CosmosClientOptions, SqlQuerySpec, DatabaseResponse, ItemResponse } from '@azure/cosmos';

import { Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';

export interface AzureCosmosDbOptions extends CosmosClientOptions {
  dbName: string;
  retryAttempts?: number;
  retryDelay?: number;
  connectionName?: string;
}

export interface AzureCosmosDbOptionsFactory {
  createAzureCosmosDbOptions(): Promise<AzureCosmosDbOptions> | AzureCosmosDbOptions;
}

export interface AzureCosmosDbModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  dbName: string;
  connectionName?: string;
  useExisting?: Type<AzureCosmosDbOptionsFactory>;
  useClass?: Type<AzureCosmosDbOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<AzureCosmosDbOptions> | AzureCosmosDbOptions;
  inject?: any[];
}
