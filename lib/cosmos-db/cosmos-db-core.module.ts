import { CosmosClient } from '@azure/cosmos';
import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import { defer } from 'rxjs';
import { COSMOS_DB_MODULE_OPTIONS } from './cosmos-db.constants';
import {
  AzureCosmosDbModuleAsyncOptions,
  AzureCosmosDbOptions,
  AzureCosmosDbOptionsFactory,
} from './cosmos-db.interface';
import { getConnectionToken, getuserAgentSuffix, handleRetry } from './cosmos-db.utils';

@Global()
@Module({})
export class AzureCosmosDbCoreModule {
  static forRoot(options: AzureCosmosDbOptions): DynamicModule {
    const { dbName, retryAttempts, retryDelay, connectionName, ...cosmosDbOptions } = options;

    const cosmosConnectionName = getConnectionToken(connectionName);

    const connectionProvider = {
      provide: cosmosConnectionName,
      useFactory: async (): Promise<any> =>
        await defer(async () => {
          cosmosDbOptions.userAgentSuffix = await getuserAgentSuffix();
          const client = new CosmosClient(cosmosDbOptions);
          const dbResponse = await client.databases.createIfNotExists({
            id: dbName,
          });
          return dbResponse.database;
        })
          .pipe(handleRetry(retryAttempts, retryDelay))

          // TODO: migrate from .toPromise().
          .toPromise(),
    };

    return {
      module: AzureCosmosDbCoreModule,
      providers: [connectionProvider],
      exports: [connectionProvider],
    };
  }

  static forRootAsync(options: AzureCosmosDbModuleAsyncOptions): DynamicModule {
    const cosmosConnectionName = getConnectionToken(options.connectionName);

    const connectionProvider = {
      provide: cosmosConnectionName,
      useFactory: async (cosmosModuleOptions: AzureCosmosDbOptions): Promise<any> => {
        const { dbName, retryAttempts, retryDelay, connectionName, ...cosmosOptions } = cosmosModuleOptions;

        return await defer(async () => {
          cosmosOptions.userAgentSuffix = await getuserAgentSuffix();
          const client = new CosmosClient(cosmosOptions);
          const dbResponse = await client.databases.createIfNotExists({
            id: dbName,
          });
          return dbResponse.database;
        })
          .pipe(handleRetry(retryAttempts, retryDelay))

          // TODO: migrate from .toPromise().
          .toPromise();
      },
      inject: [COSMOS_DB_MODULE_OPTIONS],
    };
    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: AzureCosmosDbCoreModule,
      imports: options.imports,
      providers: [...asyncProviders, connectionProvider],
      exports: [connectionProvider],
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
        provide: COSMOS_DB_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    // `as Type<AzureCosmosDbOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [(options.useClass || options.useExisting) as Type<AzureCosmosDbOptionsFactory>];
    return {
      provide: COSMOS_DB_MODULE_OPTIONS,
      useFactory: async (optionsFactory: AzureCosmosDbOptionsFactory) =>
        await optionsFactory.createAzureCosmosDbOptions(),
      inject,
    };
  }
}
