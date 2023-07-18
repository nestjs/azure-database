import { Provider } from '@nestjs/common';
import { AZURE_TABLE_STORAGE_NAME } from './azure-table.constant';
import { AzureTableStorageRepository } from './azure-table.repository';
import { AzureTableStorageService } from './azure-table.service';

type EntityFn = () => void;

export function createRepositoryProviders(entity: EntityFn): Provider[] {
  return [getRepositoryProvider(entity)];
}

export function getRepositoryProvider(entity: EntityFn): Provider {
  const provide = getRepositoryToken(entity);
  const o = {
    provide,
    useFactory: (service: AzureTableStorageService, tableName: string) => {
      return new AzureTableStorageRepository(service, tableName);
    },
    inject: [AzureTableStorageService, AZURE_TABLE_STORAGE_NAME],
  };
  return o;
}
// tslint:disable-next-line: ban-types
export function getRepositoryToken(entity: EntityFn) {
  return `${entity.name}AzureTableStorageRepository`;
}
