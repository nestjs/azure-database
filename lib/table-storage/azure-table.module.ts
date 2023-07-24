import { DynamicModule, Logger, Module, Provider } from '@nestjs/common';
import {
  AZURE_TABLE_STORAGE_FEATURE_OPTIONS,
  AZURE_TABLE_STORAGE_MODULE_OPTIONS,
  AZURE_TABLE_STORAGE_NAME,
} from './azure-table.constant';
import {
  AzureTableStorageFeatureOptions,
  AzureTableStorageModuleAsyncOptions,
  AzureTableStorageOptions,
  AzureTableStorageOptionsFactory,
} from './azure-table.interface';
import { createRepositoryProviders } from './azure-table.providers';
import { AzureTableStorageRepository } from './azure-table.repository';
import { AzureTableStorageService } from './azure-table.service';

const logger = new Logger(`AzureTableStorageModule`);

const PROVIDERS = [AzureTableStorageService, AzureTableStorageRepository];
const EXPORTS = [...PROVIDERS];

type EntityFn = /* Function */ {
  name: string;
};

@Module({})
export class AzureTableStorageModule {
  constructor() {
    if (typeof process.env.AZURE_STORAGE_CONNECTION_STRING === 'undefined') {
      logger.error(`AZURE_STORAGE_CONNECTION_STRING is not defined in the environment variables`);
    }
  }

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
        ...this.createAsyncProviders(options),
      ],
      exports: [...EXPORTS],
    };
  }

  private static createAsyncProviders(options: AzureTableStorageModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
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
    entity: EntityFn,
    options: AzureTableStorageFeatureOptions = {
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
          useValue: options.table || entity.name,
        },
        {
          provide: AZURE_TABLE_STORAGE_FEATURE_OPTIONS,
          useValue: options,
        },
      ],
      exports: [...EXPORTS, ...repositoryProviders],
    };
  }
}
