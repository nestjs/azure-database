import azure = require('azure-storage');

export const AZURE_TABLE_ENTITY_ATTR = 'azure-table-storage:attributes';
export const AZURE_TABLE_ENTITY_NAME = 'azure-table-storage:entity-name';

function annotate(value: string, type: string) {
  return (target: any /* Function */, propertyKey: string) => {
    const entityName = target.constructor.name;
    Reflect.defineMetadata(AZURE_TABLE_ENTITY_NAME, entityName, target);

    const storedAttr =
      Reflect.getMetadata(AZURE_TABLE_ENTITY_ATTR, target) || {};
    let newAttr = {
      ...storedAttr,
      [propertyKey]: { _: value, $: type },
    };

    const isPartitionKey = type === 'Edm.PartitionKey';
    const isRowKey = type === 'Edm.RowKey';
    if (isPartitionKey || isRowKey) {
      const specialPropertyKeyName = type.replace('Edm.', '');
      const specialAttr = {
        [specialPropertyKeyName]: { _: propertyKey, $: type },
      };
      newAttr = {
        ...newAttr,
        ...specialAttr,
      };
    }

    Reflect.defineMetadata(AZURE_TABLE_ENTITY_ATTR, newAttr, target);
  };
}

export const AzureTableStorage = {
  Entity() {
    return (target: any /* Function */) => {
      console.log(
        Reflect.getMetadata(AZURE_TABLE_ENTITY_ATTR, target.prototype),
      );
    };
  },
  PartitionKey(value?: string) {
    return annotate(value, 'Edm.PartitionKey');
  },
  RowKey(value?: string) {
    return annotate(value, 'Edm.RowKey');
  },
  Int32(value?: string) {
    return annotate(value, 'Edm.Int32');
  },
  Int64(value?: string) {
    return annotate(value, 'Edm.Int64');
  },
  Binary(value?: string) {
    return annotate(value, 'Edm.Binary');
  },
  Boolean(value?: string) {
    return annotate(value, 'Edm.Boolean');
  },
  String(value?: string) {
    return annotate(value, 'Edm.String');
  },
  Guid(value?: string) {
    return annotate(value, 'Edm.Guid');
  },
  Double(value?: string) {
    return annotate(value, 'Edm.Double');
  },
  DateTime(value?: string) {
    return annotate(value, 'Edm.DateTime');
  },
};
