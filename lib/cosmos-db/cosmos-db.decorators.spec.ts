import { AZURE_COSMOS_DB_ENTITY, CosmosPartitionKey } from './cosmos-db.decorators';
import { PartitionKeyDefinitionVersion, PartitionKeyKind } from '@azure/cosmos';

describe('Azure CosmosDB Decorators', () => {
  beforeEach(() => {
    // tslint:disable-next-line: no-empty
    function MockEntity() {}
  });

  describe('@CosmosPartitionKey()', () => {
    it('should add a PartitionKey ', () => {
      @CosmosPartitionKey('value')
      class MockClass {}

      const metadata = Reflect.getMetadata(AZURE_COSMOS_DB_ENTITY, MockClass);
      expect(metadata).toStrictEqual({
        PartitionKey: 'value',
      });
    });

    it('should add a Hierarchical PartitionKey ', () => {
      @CosmosPartitionKey({
        paths: ['/name', '/address/zip'],
        version: PartitionKeyDefinitionVersion.V2,
        kind: PartitionKeyKind.MultiHash,
      })
      class MockClass {}

      const metadata = Reflect.getMetadata(AZURE_COSMOS_DB_ENTITY, MockClass);
      expect(metadata).toStrictEqual({
        PartitionKey: {
          paths: ['/name', '/address/zip'],
          version: PartitionKeyDefinitionVersion.V2,
          kind: PartitionKeyKind.MultiHash,
        },
      });
    });
  });
});
