import { CosmosClient, ContainerDefinition } from '@azure/cosmos';
import { getConnectionToken, getModelToken, pluralize, getDbToken } from './cosmos-db.utils';
import { AZURE_COMSOS_DB_ENTITY } from './cosmos-db.decorators';

export interface PartitionKeyValues {
  PartitionKey: string;
}

export function createAzureCosmosDbProviders(
  connectionName?: string,
  databaseName?: string,
  models: { dto: any; collection?: string }[] = [],
) {
  const providers = (models || []).map(model => ({
    provide: getModelToken(model.dto.name),
    useFactory: async (client: CosmosClient, dbName: string) => {
      const dbResponse = await client.databases.createIfNotExists({
        id: dbName,
      });
      const database = dbResponse.database;
      //  debug('Setting up the database...done!')
      //  debug('Setting up the container...')
      const entityDescriptor = Reflect.getMetadata(AZURE_COMSOS_DB_ENTITY, model.dto) as PartitionKeyValues;
      const partitionKey = entityDescriptor ? entityDescriptor.PartitionKey : null;
      const containerName = model.collection ?? pluralize(model.dto.name);
      const containerOptions: ContainerDefinition = {
        id: containerName,
      };

      if (partitionKey != null) {
        containerOptions.partitionKey = {
          paths: [`/${partitionKey}`],
        };
      }
      const coResponse = await database.containers.createIfNotExists(containerOptions);
      // debug('Setting up the container...done!')

      return coResponse.container;
    },
    inject: [getConnectionToken(connectionName), getDbToken(databaseName)],
  }));
  return providers;
}
