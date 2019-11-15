import { CosmosClient } from '@azure/cosmos';
import { DynamicModule, Global, Inject, Module, Provider, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { defer } from 'rxjs';
import {
  AZURE_COSMOS_DB_CONNECTION_NAME,
  AZURE_COSMOS_DB_MODULE_OPTIONS,
  AZURE_COSMOS_DB_NAME,
} from './cosmos-db.constants';
import {
  AzureCosmosDbModuleAsyncOptions,
  AzureCosmosDbOptions,
  AzureCosmosDbOptionsFactory,
} from './cosmos-db.interface';
import { getConnectionToken, getDbToken, handleRetry } from './cosmos-db.utils';

@Global()
@Module({})
export class AzureCosmosDbCoreModule {
  constructor(
    @Inject(AZURE_COSMOS_DB_CONNECTION_NAME) private readonly connectionName: string,
    private readonly moduleRef: ModuleRef,
  ) {}

  static forRoot(options: AzureCosmosDbOptions): DynamicModule {
    const { retryAttempts, retryDelay, connectionName, dbName, ...cosmosDbOptions } = options;

    const cosmosConnectionName = getConnectionToken(connectionName);
    const cosmosDbName = getDbToken(dbName);

    const cosmosConnectionNameProvider = {
      provide: AZURE_COSMOS_DB_CONNECTION_NAME,
      useValue: cosmosConnectionName,
    };

    const cosmosDbNameProvider = {
      provide: AZURE_COSMOS_DB_NAME,
      useValue: cosmosDbName,
    };

    const connectionProvider = {
      provide: cosmosConnectionName,
      useFactory: async (): Promise<any> =>
        await defer(async () => new CosmosClient(cosmosDbOptions))
          .pipe(handleRetry(retryAttempts, retryDelay))
          .toPromise(),
    };

    const dbNameProvider = {
      provide: cosmosDbName,
      useValue: dbName,
    };

    return {
      module: AzureCosmosDbCoreModule,
      providers: [cosmosDbNameProvider, connectionProvider, cosmosConnectionNameProvider, dbNameProvider],
      exports: [connectionProvider, cosmosDbNameProvider, dbNameProvider],
    };
  }

  static forRootAsync(options: AzureCosmosDbModuleAsyncOptions): DynamicModule {
    const cosmosConnectionName = getConnectionToken(options.connectionName);
    const cosmosDbName = getDbToken(options.dbName);

    const cosmosConnectionNameProvider = {
      provide: AZURE_COSMOS_DB_CONNECTION_NAME,
      useValue: cosmosConnectionName,
    };

    const cosmosDbNameProvider = {
      provide: AZURE_COSMOS_DB_NAME,
      useValue: cosmosDbName,
    };

    const dbNameProvider = {
      provide: cosmosDbName,
      useValue: options.dbName,
    };

    const connectionProvider = {
      provide: cosmosConnectionName,
      useFactory: async (cosmosModuleOptions: AzureCosmosDbOptions): Promise<any> => {
        const { retryAttempts, retryDelay, connectionName, dbName, ...cosmosOptions } = cosmosModuleOptions;

        return await defer(async () => new CosmosClient(cosmosOptions))
          .pipe(handleRetry(retryAttempts, retryDelay))
          .toPromise();
      },
      inject: [AZURE_COSMOS_DB_MODULE_OPTIONS],
    };
    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: AzureCosmosDbCoreModule,
      imports: options.imports,
      providers: [
        ...asyncProviders,
        connectionProvider,
        cosmosConnectionNameProvider,
        cosmosDbNameProvider,
        dbNameProvider,
      ],
      exports: [connectionProvider, cosmosDbNameProvider, dbNameProvider],
    };
  }

  private static createAsyncProviders(options: AzureCosmosDbModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<AzureCosmosDbOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(options: AzureCosmosDbModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: AZURE_COSMOS_DB_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    // `as Type<AzureCosmosDbOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [(options.useClass || options.useExisting) as Type<AzureCosmosDbOptionsFactory>];
    return {
      provide: AZURE_COSMOS_DB_MODULE_OPTIONS,
      useFactory: async (optionsFactory: AzureCosmosDbOptionsFactory) =>
        await optionsFactory.createAzureCosmosDbOptions(),
      inject,
    };
  }
}
