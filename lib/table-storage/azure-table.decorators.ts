import { Inject } from '@nestjs/common';
import { getRepositoryToken } from './azure-table.providers';
import { ValueType } from './azure-table.interface';

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

function validateType(edmType: AnnotationPropertyType, target: object /* Function */, propertyKey?: string) {
  if (propertyKey) {
    // tslint:disable-next-line: ban-types
    const propertyType = Reflect.getMetadata('design:type', target, propertyKey) as Function;

    let edmTypeName = '';
    if (edmType === 'Edm.Int32' || edmType === 'Edm.Int64' || edmType === 'Edm.Double') {
      edmTypeName = Number.name;
    } else if (edmType === 'Edm.Boolean') {
      edmTypeName = Boolean.name;
    } else if (edmType === 'Edm.DateTime') {
      edmTypeName = Date.name;
    } else if (edmType === 'Edm.String' || edmType === 'Edm.Guid') {
      edmTypeName = String.name;
    } else if (edmType === 'Edm.Binary') {
      edmTypeName = Blob.name;
    } else {
      throw new Error(`Type ${edmType} is not supported.`);
    }

    if (edmTypeName.toLowerCase().includes(propertyType.name.toLocaleLowerCase()) === false) {
      throw new Error(
        `EDM type of "${target.constructor.name}.${propertyKey}" is ${edmType}. The equivalent of ${edmType} is ${edmTypeName}. ` +
          `"${propertyKey}" should be of type ${edmTypeName}. Got ${propertyType.name}`,
      );
    }
  }
}

function annotate(value: ValueType, type: AnnotationPropertyType) {
  return (target: object /* Function */, propertyKey?: string | undefined) => {
    // check if the property type matches the annotated type
    validateType(type, target, propertyKey);

    const isPropertyAnnotation = typeof propertyKey === 'string';

    // define metadata on the parent level
    target = isPropertyAnnotation ? target.constructor : target;

    // get previous stored entity descriptor
    const storedEntityDescriptor = Reflect.getMetadata(AZURE_TABLE_ENTITY, target) || {};
    let entityDescriptor = {
      ...storedEntityDescriptor,
    };

    const val = typeof value === 'string' ? value : value(new (target as any)());

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
        [propertyKey]: { _: val, $: type },
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
          [type]: { _: val || propertyKey, $: 'Edm.String' },
        };
      }
    }

    Reflect.defineMetadata(AZURE_TABLE_ENTITY, entityDescriptor, target);
  };
}

export function EntityPartitionKey(value: ValueType) {
  return annotate(value, 'PartitionKey');
}

export function EntityRowKey(value: ValueType) {
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

export const InjectRepository = (
  // tslint:disable-next-line: ban-types
  entity: Function,
) => Inject(getRepositoryToken(entity));
