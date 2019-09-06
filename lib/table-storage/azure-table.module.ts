import { DynamicModule, Module } from '@nestjs/common';
import { AZURE_TABLE_STORAGE_MODULE_OPTIONS, AZURE_TABLE_STORAGE_NAME } from './azure-table.constant';
import { AzureTableStorageOptions } from './azure-table.interface';
import { AzureTableStorageRepository } from './azure-table.repository';
import { AzureTableStorageService } from './azure-table.service';

const PUBLIC_PROVIDERS = [AzureTableStorageService, AzureTableStorageRepository];

@Module({})
export class AzureTableStorageModule {
  static forRoot(options?: AzureTableStorageOptions): DynamicModule {
    return {
      module: AzureTableStorageModule,
      providers: [...PUBLIC_PROVIDERS, { provide: AZURE_TABLE_STORAGE_MODULE_OPTIONS, useValue: options }],
      exports: [...PUBLIC_PROVIDERS, AZURE_TABLE_STORAGE_MODULE_OPTIONS],
    };
  }

  static forFeature({
    table,
    createTableIfNotExists = false,
  }: {
    table: string;
    createTableIfNotExists: boolean;
  }): DynamicModule {
    return {
      module: AzureTableStorageModule,
      providers: [
        ...PUBLIC_PROVIDERS,
        {
          provide: AZURE_TABLE_STORAGE_NAME,
          useFactory: async (azureTableStorageService: AzureTableStorageService) => {
            if (createTableIfNotExists) {
              const creationResult = await azureTableStorageService.createTableIfNotExists(table);
              return creationResult.TableName;
            }
            return table;
          },
          inject: [AzureTableStorageService],
        },
      ],
      exports: [...PUBLIC_PROVIDERS],
    };
  }
}
