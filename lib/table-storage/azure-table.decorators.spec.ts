import {
  AZURE_TABLE_ENTITY,
  EntityPartitionKey,
  InjectRepository,
  EntityRowKey,
  EntityInt32,
  EntityInt64,
  EntityBinary,
  EntityBoolean,
  EntityString,
  EntityDateTime,
} from './azure-table.decorators';

describe('Azure Table Storage Decorators', () => {
  beforeEach(() => {
    // tslint:disable-next-line: no-empty
    function MockEntity() {}
  });

  describe('@InjectRepository()', () => {
    // tslint:disable-next-line: no-empty
    function MockEntity() {}
    const value = InjectRepository(MockEntity);

    it('should be of type function', () => {
      expect(typeof value).toBe('function');
    });

    it('should throw when invoked with null tagret', () => {
      expect(() => {
        value(null, null);
      }).toThrow();
    });
    it('should not throw when invoked', () => {
      // tslint:disable-next-line: no-empty
      function MockClass() {}
      expect(() => {
        value(MockClass, null);
      }).not.toThrow();
    });
  });

  describe('@EntityPartitionKey()', () => {
    it('should add a PartitionKey ', () => {
      @EntityPartitionKey('value')
      class MockClass {}

      const metadata = Reflect.getMetadata(AZURE_TABLE_ENTITY, MockClass);
      expect(metadata).toStrictEqual({
        PartitionKey: {
          $: 'Edm.String',
          _: 'value',
        },
      });
    });

    it('should add a PartitionKey based on Fn', () => {
      @EntityPartitionKey(d => d.id + d.name)
      class MockClass {
        id = '1';
        name = '2';
      }

      const metadata = Reflect.getMetadata(AZURE_TABLE_ENTITY, MockClass);
      expect(metadata).toStrictEqual({
        PartitionKey: {
          $: 'Edm.String',
          _: '12',
        },
      });
    });
  });

  describe('@EntityRowKey()', () => {
    it('should add a RowKey ', () => {
      @EntityRowKey('value')
      class MockClass {}

      const metadata = Reflect.getMetadata(AZURE_TABLE_ENTITY, MockClass);
      expect(metadata).toStrictEqual({
        RowKey: {
          $: 'Edm.String',
          _: 'value',
        },
      });
    });
  });

  [
    {
      fn: EntityInt32,
      tsType: 'Number',
    },
    {
      fn: EntityInt64,
      tsType: 'Number',
    },
    {
      fn: EntityBinary,
      tsType: 'Blob',
    },
    {
      fn: EntityBoolean,
      tsType: 'Boolean',
    },
    {
      fn: EntityString,
      tsType: 'String',
    },
    {
      fn: EntityDateTime,
      tsType: 'Date',
    },
  ].map(decorator => {
    testDecorator(decorator.fn.name, decorator.fn, decorator.fn.name.replace('Entity', ''), decorator.tsType);
  });
});

function testDecorator(name: string, fn: Function, edmType: string, tsType: string) {
  describe(`@${name}()`, () => {
    it(`should throw if property type is NOT ${edmType}`, () => {
      // tslint:disable-next-line: no-empty

      expect(() => {
        class MockClass {
          @fn()
          prop: undefined;
        }
      }).toThrow();
    });
  });
}
