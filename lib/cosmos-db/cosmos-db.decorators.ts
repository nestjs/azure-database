import { Inject } from '@nestjs/common';
// import { getRepositoryToken } from './cosmos-db.providers';
import { getConnectionToken, getModelToken } from './cosmos-db.utils';

export const AZURE_COMSOS_DB_ENTITY = 'azure-cosmos-db:entity';

type AnnotationPropertyType = 'PartitionKey';

function annotate(value: string, type: AnnotationPropertyType) {
  return (target: object /* Function */, propertyKey?: string | undefined) => {
    const isPropertyAnnotation = typeof propertyKey === 'string';

    // define metadata on the parent level
    target = isPropertyAnnotation ? target.constructor : target;

    // get previous stored entity descriptor
    const storedEntityDescriptor = Reflect.getMetadata(AZURE_COMSOS_DB_ENTITY, target) || {};
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
       *
       * Example:
       *   @PartitionKey('ContactID')
       *   export class ContactEntity {}
       *
       * Would result into the following descriptor:
       *   { PartitionKey: 'ContactID' }
       *
       */

      const isPartitionKey = type === 'PartitionKey';
      if (isPartitionKey) {
        entityDescriptor = {
          ...entityDescriptor,
          [type]: value || propertyKey,
        };
      }
    }

    Reflect.defineMetadata(AZURE_COMSOS_DB_ENTITY, entityDescriptor, target);
  };
}

export function CosmosPartitionKey(value: string) {
  return annotate(value, 'PartitionKey');
}

// export function EntityRowKey(value: string) {
//   return annotate(value, 'RowKey');
// }

// export function EntityInt32(value?: string) {
//   return annotate(value, 'Edm.Int32');
// }

// export function EntityInt64(value?: string) {
//   return annotate(value, 'Edm.Int64');
// }

// export function EntityBinary(value?: string) {
//   return annotate(value, 'Edm.Binary');
// }

// export function EntityBoolean(value?: string) {
//   return annotate(value, 'Edm.Boolean');
// }

// export function EntityString(value?: string) {
//   return annotate(value, 'Edm.String');
// }

// export function EntityGuid(value?: string) {
//   return annotate(value, 'Edm.Guid');
// }

// export function EntityDouble(value?: string) {
//   return annotate(value, 'Edm.Double');
// }

// export function EntityDateTime(value?: string) {
//   return annotate(value, 'Edm.DateTime');
// }

// export const InjectRepository = (
//   // tslint:disable-next-line: ban-types
//   entity: Function,
// ) => Inject(getRepositoryToken(entity));

export const InjectModel = (model: string) => Inject(getModelToken(model));

export const InjectConnection = (name?: string) => Inject(getConnectionToken(name));
