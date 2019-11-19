import { ContainerDefinition, CosmosClient, IndexKind, DataType } from '@azure/cosmos';
import { COMSOS_DB_ENTITY } from './cosmos-db.decorators';
import { getConnectionToken, getDbToken, getModelToken, pluralize } from './cosmos-db.utils';

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
      const entityDescriptor = Reflect.getMetadata(COMSOS_DB_ENTITY, model.dto) as PartitionKeyValues;
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
