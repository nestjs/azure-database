import { Provider } from '@nestjs/common';
import { AZURE_TABLE_STORAGE_NAME } from './azure-table.constant';
import { AzureTableStorageRepository } from './azure-table.repository';
import { AzureTableStorageService } from './azure-table.service';

// tslint:disable-next-line: ban-types
export function createRepositoryProviders(entity: Function): Provider[] {
  return [getRepositoryProvider(entity)];
}

// tslint:disable-next-line: ban-types
export function getRepositoryProvider(entity: Function): Provider {
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
export function getRepositoryToken(entity: Function) {
  return `${entity.name}AzureTableStorageRepository`;
}
