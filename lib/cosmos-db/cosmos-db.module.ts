import { DynamicModule, Module } from '@nestjs/common';
import { AzureCosmosDbModuleAsyncOptions, AzureCosmosDbOptions } from './cosmos-db.interface';
import { AzureCosmosDbCoreModule } from './cosmos-db-core.module';
import { createAzureCosmosDbProviders } from './cosmos-db.providers';

@Module({})
export class AzureCosmosDbModule {
  static forRoot(options: AzureCosmosDbOptions): DynamicModule {
    return {
      module: AzureCosmosDbModule,
      imports: [AzureCosmosDbCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: AzureCosmosDbModuleAsyncOptions): DynamicModule {
    return {
      module: AzureCosmosDbModule,
      imports: [AzureCosmosDbCoreModule.forRootAsync(options)],
    };
  }

  static forFeature(
    models: { dto: any; collection?: string }[] = [],
    databaseName?: string,
    connectionName?: string,
  ): DynamicModule {
    const providers = createAzureCosmosDbProviders(connectionName, databaseName, models);
    return {
      module: AzureCosmosDbModule,
      providers,
      exports: providers,
    };
  }
}
