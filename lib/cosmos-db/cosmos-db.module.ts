import { DynamicModule, Module } from '@nestjs/common';
import { AzureCosmosDbCoreModule } from './cosmos-db-core.module';
import { AzureCosmosDbModuleAsyncOptions, AzureCosmosDbOptions } from './cosmos-db.interface';
import { createAzureCosmosDbProviders, getAzureCosmosRepositoryProvider } from './cosmos-db.providers';

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

  static forFeature(models: { dto: any; collection?: string }[] = [], connectionName?: string): DynamicModule {
    const providers = createAzureCosmosDbProviders(connectionName, models);
    const repositoryProviders = models.map((model: { dto: any }) => {
      return getAzureCosmosRepositoryProvider(model);
    });

    return {
      module: AzureCosmosDbModule,
      providers: [...providers, ...repositoryProviders],
      exports: [...providers, ...repositoryProviders],
    };
  }
}
