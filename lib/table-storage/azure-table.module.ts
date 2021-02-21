import { DynamicModule, Module, Provider } from '@nestjs/common';
import { AZURE_TABLE_STORAGE_MODULE_OPTIONS, AZURE_TABLE_STORAGE_NAME } from './azure-table.constant';
import {
  AzureTableStorageOptions,
  AzureTableStorageFeatureOptions,
  AzureTableStorageModuleAsyncOptions,
  AzureTableStorageOptionsFactory,
} from './azure-table.interface';
import { createRepositoryProviders } from './azure-table.providers';
import { AzureTableStorageRepository } from './azure-table.repository';
import { AzureTableStorageService } from './azure-table.service';

const PROVIDERS = [AzureTableStorageService, AzureTableStorageRepository];
const EXPORTS = [...PROVIDERS];

@Module({})
export class AzureTableStorageModule {
  static forRoot(options?: AzureTableStorageOptions): DynamicModule {
    return {
      module: AzureTableStorageModule,
      providers: [
        ...PROVIDERS,
        { provide: AZURE_TABLE_STORAGE_MODULE_OPTIONS, useValue: options },
        {
          provide: AZURE_TABLE_STORAGE_NAME,
          useValue: '',
        },
      ],
      exports: [...EXPORTS, AZURE_TABLE_STORAGE_MODULE_OPTIONS],
    };
  }

  static forRootAsync(options: AzureTableStorageModuleAsyncOptions): DynamicModule {
    return {
      module: AzureTableStorageModule,
      imports: options.imports,
      providers: [
        {
          provide: AZURE_TABLE_STORAGE_NAME,
          useValue: '',
        },
        ...PROVIDERS,
        this.createAsyncOptionsProvider(options),
      ],
      exports: [...EXPORTS],
    };
  }

  private static createAsyncOptionsProvider(options: AzureTableStorageModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: AZURE_TABLE_STORAGE_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject,
      };
    }

    return {
      provide: AZURE_TABLE_STORAGE_MODULE_OPTIONS,
      useFactory: async (optionsFactory: AzureTableStorageOptionsFactory) =>
        await optionsFactory.createAzureTableStorageOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }

  static forFeature(
    // tslint:disable-next-line: ban-types
    entity: Function,
    { table, createTableIfNotExists }: AzureTableStorageFeatureOptions = {
      // use either the given table name or the entity name
      table: entity.name,
      createTableIfNotExists: false,
    },
  ): DynamicModule {
    const repositoryProviders = createRepositoryProviders(entity);

    return {
      module: AzureTableStorageModule,
      providers: [
        ...PROVIDERS,
        ...repositoryProviders,
        {
          provide: AZURE_TABLE_STORAGE_NAME,
          useFactory: async (azureTableStorageService: AzureTableStorageService) => {
            if (createTableIfNotExists) {
              table = (await azureTableStorageService.createTableIfNotExists(table)).TableName;
            }
            return table;
          },
          inject: [AzureTableStorageService],
        },
      ],
      exports: [...EXPORTS, ...repositoryProviders],
    };
  }
}
