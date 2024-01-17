import { Inject } from '@nestjs/common';
import { PartitionKeyKind, PartitionKeyDefinitionVersion } from '@azure/cosmos';
import { getConnectionToken, getModelToken } from './cosmos-db.utils';

export const AZURE_COSMOS_DB_ENTITY = 'cosmos-db:entity';

type AnnotationPropertyType = 'PartitionKey' | 'DateTime' | 'UniqueKey';
type HierarchicalPartitionKey = {
  id?: string;
  paths: string[];
  version: PartitionKeyDefinitionVersion;
  kind: PartitionKeyKind;
}

function validateType(annotationType: AnnotationPropertyType, target: object /* Function */, propertyKey?: string) {
  if (propertyKey) {
    // tslint:disable-next-line: ban-types
    const propertyType = Reflect.getMetadata('design:type', target, propertyKey) as () => void;

    let propertyTypeName = '';
    if (annotationType === 'DateTime') {
      propertyTypeName = Date.name;
    } else if (annotationType === 'UniqueKey') {
      propertyTypeName = String.name;
    } else {
      throw new Error(`Type ${annotationType} is not supported.`);
    }

    if (propertyTypeName.toLowerCase().includes(propertyType.name.toLocaleLowerCase()) === false) {
      throw new Error(
        `EDM type of "${target.constructor.name}.${propertyKey}" is ${annotationType}. The equivalent of ${annotationType} is ${propertyTypeName}. ` +
          `"${propertyKey}" should be of type ${propertyTypeName}. Got ${propertyType.name}`,
      );
    }
  }
}

function annotate(value: string | HierarchicalPartitionKey, type: AnnotationPropertyType) {
  return (target: object /* Function */, propertyKey?: string | undefined) => {
    // check if the property type matches the annotated type
    validateType(type, target, propertyKey);

    const isPropertyAnnotation = typeof propertyKey === 'string';

    // define metadata on the parent level
    target = isPropertyAnnotation ? target.constructor : target;

    // get previous stored entity descriptor
    const storedEntityDescriptor = Reflect.getMetadata(AZURE_COSMOS_DB_ENTITY, target) || {};
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
        [propertyKey]: type,
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
        if (typeof value === 'string') {
          entityDescriptor = {
            ...entityDescriptor,
            [type]: value || propertyKey,
          };
        }
        else {
          entityDescriptor = {
            ...entityDescriptor,
            [type]: {
              paths: value.paths,
              version: value.version,
              kind: value.kind,
            },
          };
        }
      }
    }

    Reflect.defineMetadata(AZURE_COSMOS_DB_ENTITY, entityDescriptor, target);
  };
}

export function CosmosPartitionKey(value: string | HierarchicalPartitionKey) {
  return annotate(value, 'PartitionKey');
}

export function CosmosDateTime(value?: string) {
  return annotate(value, 'DateTime');
}

export function CosmosUniqueKey(value?: string) {
  return annotate(value, 'UniqueKey');
}

export const InjectModel = (model: any) => Inject(getModelToken(model.name));

export const InjectConnection = (name?: string) => Inject(getConnectionToken(name));
