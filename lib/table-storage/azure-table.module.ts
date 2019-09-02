import { DynamicModule, Module } from '@nestjs/common';
import { AZURE_TABLE_MODULE_OPTIONS } from './azure-table.constant';
import {
  AzureTableStorageService,
  AzureStorageOptions,
} from './azure-table.service';

const PUBLIC_PROVIDERS = [AzureTableStorageService];

@Module({
  providers: [...PUBLIC_PROVIDERS],
  exports: [...PUBLIC_PROVIDERS, AZURE_TABLE_MODULE_OPTIONS],
})
export class AzureTableStorageModule {
  static withConfig(options: AzureStorageOptions): DynamicModule {
    return {
      module: AzureTableStorageModule,
      providers: [{ provide: AZURE_TABLE_MODULE_OPTIONS, useValue: options }],
    };
  }
}
