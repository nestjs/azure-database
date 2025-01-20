import {
  AZURE_TABLE_ENTITY,
  EntityBinary,
  EntityBoolean,
  EntityDateTime,
  EntityInt32,
  EntityInt64,
  EntityPartitionKey,
  EntityRowKey,
  EntityString,
  InjectRepository,
} from './azure-table.decorators';

type DecoratorFn = () => (target: object, propertyKey?: string) => void;

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

    it('should throw when invoked with null target', () => {
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

  describe.skip('[DEPRECATED] @EntityPartitionKey()', () => {
    it.skip('should add a PartitionKey ', () => {
      @EntityPartitionKey('value')
      class MockClass {}

      const metadata = Reflect.getMetadata(AZURE_TABLE_ENTITY, MockClass);
      expect(metadata).toStrictEqual({
        partitionKey: 'value',
      });
    });

    it.skip('should add a PartitionKey based on Fn', () => {
      @EntityPartitionKey(d => d.id + d.name)
      class MockClass {
        id = '1';
        name = '2';
      }

      const metadata = Reflect.getMetadata(AZURE_TABLE_ENTITY, MockClass);
      expect(metadata).toStrictEqual({
        partitionKey: '12',
      });
    });
  });

  describe.skip('[DEPRECATED] @EntityRowKey()', () => {
    it('should add a RowKey ', () => {
      @EntityRowKey('value')
      class MockClass {}

      const metadata = Reflect.getMetadata(AZURE_TABLE_ENTITY, MockClass);
      expect(metadata).toStrictEqual({
        rowKey: 'value',
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

function testDecorator(name: string, fn: DecoratorFn, edmType: string, tsType: string) {
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
