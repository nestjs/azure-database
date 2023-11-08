import { Provider } from '@nestjs/common';
import { AZURE_TABLE_STORAGE_FEATURE_OPTIONS, AZURE_TABLE_STORAGE_NAME } from './azure-table.constant';
import { AzureTableStorageFeatureOptions } from './azure-table.interface';
import { AzureTableStorageRepository } from './azure-table.repository';
import { AzureTableStorageService } from './azure-table.service';

type EntityFn = /* Function */ {
  name: string;
};

export function createRepositoryProviders(entity: EntityFn): Provider[] {
  return [getRepositoryProvider(entity)];
}

export function getRepositoryProvider(entity: EntityFn): Provider {
  const provide = getRepositoryToken(entity);
  const o = {
    provide,
    useFactory: (service: AzureTableStorageService, tableName: string, options: AzureTableStorageFeatureOptions) => {
      return new AzureTableStorageRepository(service, tableName, options);
    },
    inject: [AzureTableStorageService, AZURE_TABLE_STORAGE_NAME, AZURE_TABLE_STORAGE_FEATURE_OPTIONS],
  };
  return o;
}

export function getRepositoryToken(entity: EntityFn) {
  return `${entity.name}AzureTableStorageRepository`;
}
