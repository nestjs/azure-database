import { ContainerDefinition, IndexKind, DataType, Database, Container } from '@azure/cosmos';
import { AZURE_COSMOS_DB_ENTITY } from './cosmos-db.decorators';
import { getConnectionToken, getModelToken, pluralize } from './cosmos-db.utils';
import { Provider } from '@nestjs/common';
import { CosmosDbRepository } from './cosmos-db.repository';

export interface PartitionKeyValues {
  PartitionKey: string;
}

export function createAzureCosmosDbProviders(
  connectionName?: string,
  models: { dto: any; collection?: string }[] = [],
) {
  const providers = (models || []).map(model => ({
    provide: getModelToken(model.dto.name),
    useFactory: async (database: Database) => {
      const entityDescriptor = Reflect.getMetadata(AZURE_COSMOS_DB_ENTITY, model.dto) as PartitionKeyValues;
      const partitionKey = entityDescriptor ? entityDescriptor.PartitionKey : null;
      const containerName = model.collection ?? pluralize(model.dto.name);
      const containerOptions: ContainerDefinition = {
        id: containerName,
      };

      // If the container has a DateTime field we add a Range Index
      // ref: https://docs.microsoft.com/en-us/azure/cosmos-db/working-with-dates#indexing-datetimes-for-range-queries
      if (Object.values(entityDescriptor).indexOf('DateTime') > -1) {
        containerOptions.indexingPolicy = {
          includedPaths: [
            {
              path: `/*`,
              indexes: [
                {
                  kind: IndexKind.Range,
                  dataType: DataType.String,
                  precision: -1,
                },
              ],
            },
          ],
        };
      }

      for (const key in entityDescriptor) {
        if (entityDescriptor.hasOwnProperty(key)) {
          const element = entityDescriptor[key];
          if (element === 'UniqueKey') {
            containerOptions.uniqueKeyPolicy.uniqueKeys.push({ paths: [`/${element}`] });
          }
        }
      }

      if (partitionKey != null) {
        containerOptions.partitionKey = {
          paths: [`/${partitionKey}`],
        };
      }
      const coResponse = await database.containers.createIfNotExists(containerOptions);

      return coResponse.container;
    },
    inject: [getConnectionToken(connectionName)],
  }));
  return providers;
}

export function getAzureCosmosRepositoryProvider(model: { dto: any }): Provider {
  const provide = getAzureCosmosRepositoryToken(model.dto.name);
  const o = {
    provide,
    useFactory: (container: Container) => {
      return new CosmosDbRepository(container);
    },
    inject: [getModelToken(model.dto.name)],
  };
  return o;
}

export function getAzureCosmosRepositoryToken(entity: string) {
  return `${entity}AzureCosmosDbRepository`;
}
