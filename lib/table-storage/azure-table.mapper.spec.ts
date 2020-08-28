import { AZURE_TABLE_ENTITY } from './azure-table.decorators';
import { AzureEntityMapper, PartitionRowKeyValues } from './azure-table.mapper';

class MockEntity {
  foo: string;
}

describe('AzureEntityMapper', () => {
  describe('createEntity()', () => {
    it('should always return new entity instance', () => {
      const entityDescriptorMock: PartitionRowKeyValues & any = {
        RowKey: { _: '', $: '' },
        PartitionKey: { _: '', $: '' },
        foo: { _: '', $: '' },
      };

      Reflect.defineMetadata(AZURE_TABLE_ENTITY, entityDescriptorMock, MockEntity);
      Reflect.defineMetadata(AZURE_TABLE_ENTITY, entityDescriptorMock, MockEntity);

      const test = new MockEntity();
      const test2 = new MockEntity();

      test.foo = 'foo';

      const entity = AzureEntityMapper.createEntity<MockEntity>(test);
      const entity2 = AzureEntityMapper.createEntity<MockEntity>(test2);

      expect(entity).not.toBe(entity2);
      expect(entity.foo).not.toEqual(entity2.foo);
    });
  });
});
