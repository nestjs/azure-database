import { ModuleMetadata, Type } from '@nestjs/common';
import { AzureTableStorageRepository } from './azure-table.repository';
import { TableServiceClientOptions } from '@azure/data-tables';

export interface AzureTableStorageOptions extends TableServiceClientOptions {
  accountName?: string;
  sasKey?: string;
  connectionString?: string;
}

export interface AzureTableStorageOptionsFactory {
  createAzureTableStorageOptions(): Promise<AzureTableStorageOptions> | AzureTableStorageOptions;
}

export interface AzureTableStorageModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<AzureTableStorageOptionsFactory>;
  useClass?: Type<AzureTableStorageOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<AzureTableStorageOptions> | AzureTableStorageOptions;
  inject?: any[];
}

export interface AzureTableStorageFeatureOptions {
  table?: string;
  createTableIfNotExists?: boolean;
}

export type ValueType = ((e: any) => string) | string;

export type Repository<T> = AzureTableStorageRepository<T>;
