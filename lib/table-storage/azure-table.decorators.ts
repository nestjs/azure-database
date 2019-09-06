export const AZURE_TABLE_ENTITY = 'azure-table-storage:entity';

type AnnotationPropertyType =
  | 'PartitionKey'
  | 'RowKey'
  | 'Edm.Int32'
  | 'Edm.Int64'
  | 'Edm.Binary'
  | 'Edm.Boolean'
  | 'Edm.String'
  | 'Edm.Guid'
  | 'Edm.Double'
  | 'Edm.DateTime';

function annotate(value: string, type: AnnotationPropertyType) {
  return (target: object /* Function */, propertyKey?: string | undefined) => {
    const isPropertyAnnotation = typeof propertyKey === 'string';

    // define metadata on the parent level
    target = isPropertyAnnotation ? target.constructor : target;

    // get previous stored entity descriptor
    const storedEntityDescriptor =
      Reflect.getMetadata(AZURE_TABLE_ENTITY, target) || {};
    let entityDescriptor = {
      ...storedEntityDescriptor,
    };

    // Note: if propertyKey is truthy, we are then annotating a class property declaration
    if (isPropertyAnnotation) {
      /*
      merge previous entity descriptor and new descriptor:
      the new descriptor is a mapping of:
      - the annotated $propertyKey
      - and the required $type
      - we also assign any given $value (undefinde otherwise)
      */

      entityDescriptor = {
        [propertyKey]: { _: value, $: type },
        ...entityDescriptor,
      };
    } else {
      //
      /**
       * Class annotation.
       *
       * we need to check for special $type: PartitionKey and RowKey
       * if detected, we create a new entry in the descriptor with:
       * - the $type as the propertyKey name (PartitionKey or RowKey)
       * - the value (_) of the newly added property key is the annotated propertyKey
       *
       * Example:
       *   @PartitionKey('ContactID')
       *   @EntityRowKey('ContactName')
       *   export class ContactEntity {}
       *
       * Would result into the following descriptor:
       *   { PartitionKey: { _: 'ContactID', '$': 'Edm.String' }, RowKey: { _: 'ContactName', '$': 'Edm.String' } }
       *
       * Note:
       *  Make sure the type of PartitionKey and RowKey property keys is Edm.String
       */

      const isPartitionKey = type === 'PartitionKey';
      const isRowKey = type === 'RowKey';
      if (isPartitionKey || isRowKey) {
        entityDescriptor = {
          ...entityDescriptor,
          [type]: { _: value || propertyKey, $: 'Edm.String' },
        };
      }
    }

    Reflect.defineMetadata(AZURE_TABLE_ENTITY, entityDescriptor, target);
  };
}

export function EntityPartitionKey(value: string) {
  return annotate(value, 'PartitionKey');
}

export function EntityRowKey(value: string) {
  return annotate(value, 'RowKey');
}

export function EntityInt32(value?: string) {
  return annotate(value, 'Edm.Int32');
}

export function EntityInt64(value?: string) {
  return annotate(value, 'Edm.Int64');
}

export function EntityBinary(value?: string) {
  return annotate(value, 'Edm.Binary');
}

export function EntityBoolean(value?: string) {
  return annotate(value, 'Edm.Boolean');
}

export function EntityString(value?: string) {
  return annotate(value, 'Edm.String');
}

export function EntityGuid(value?: string) {
  return annotate(value, 'Edm.Guid');
}

export function EntityDouble(value?: string) {
  return annotate(value, 'Edm.Double');
}

export function EntityDateTime(value?: string) {
  return annotate(value, 'Edm.DateTime');
}
