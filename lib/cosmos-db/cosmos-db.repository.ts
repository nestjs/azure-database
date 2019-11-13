// import { Inject, Injectable, Logger } from '@nestjs/common';
// import { AZURE_COSMOS_DB_CONNECTION_NAME } from './cosmos-db.constants';
// import {
//   //AzureTableContinuationToken,
//   AzureCosmosDbQuery,
//   AzureCosmosDbResponse,
//   AzureCosmosDbResultList,
//   Repository,
// } from './cosmos-db.interface';
// import { AzureEntityMapper } from './cosmos-db.mapper';
// // import { AzureCosmosDbService } from './cosmos-db.service';
// // import azure = require('azure-storage');

// const logger = new Logger(`AzureStorageRepository`);

// @Injectable()
// export class AzureCosmosDbRepository<T> implements Repository<T> {
//   // tslint:disable-next-line: variable-name
//   private _query: AzureCosmosDbQuery = null;
//   private get query(): AzureCosmosDbQuery {
//     // first call we return this.manager.queryInstance
//     // next calls we return this._query
//     return this._query || this.manager.queryInstance;
//   }
//   private set query(value: AzureCosmosDbQuery | null) {
//     this._query = value;
//   }
//   constructor(
//     private readonly manager: AzureCosmosDbService,
//     @Inject(AZURE_COSMOS_DB_CONNECTION_NAME) private readonly containerName,
//   ) {}

//   async findAll(
//     tableQuery?: AzureCosmosDbQuery,
//     // currentToken?: AzureTableContinuationToken,
//   ): Promise<AzureCosmosDbResultList<T>> {
//     // get the query locally if any
//     tableQuery = this.query || tableQuery;

//     const result = await this.manager.queryEntities<azure.TableService.EntityMetadata>(
//       this.tableName,
//       tableQuery,
//       currentToken,
//     );
//     const numberOfEntities = (result.entries || []).length;

//     if (numberOfEntities <= 0) {
//       logger.debug(`No Entities found in table ${this.tableName} ${this.query && 'for query'}`);
//     } else {
//       if (numberOfEntities === 1) {
//         logger.debug(`Found 1 Entity in table ${this.tableName} ${this.query && 'for query'}`);
//       } else {
//         logger.debug(`Found ${numberOfEntities} Entities in table ${this.tableName} ${this.query && 'for query'}`);
//       }
//     }

//     if (this.query) {
//       console.table(this.toQueryObject());
//       // reset local query
//       this.query = null;
//     }

//     return {
//       ...result,
//       entries: AzureEntityMapper.serializeAll<T>(result.entries),
//     };
//   }
//   async find(rowKey: string, entity: Partial<T>): Promise<T> {
//     logger.debug(`Looking for Entity RowKey=${rowKey} in ${this.tableName}`);

//     const partitionKey = AzureEntityMapper.createEntity(entity, rowKey).PartitionKey._;
//     const result = await this.manager.retrieveEntity<azure.TableService.EntityMetadata>(
//       this.tableName,
//       partitionKey,
//       rowKey,
//     );

//     console.table(result, ['(index)', '$', '_']);
//     const mappedEntity = AzureEntityMapper.serialize<T>(result);
//     return Object.entries(mappedEntity).length === 0 ? null : mappedEntity;
//   }

//   async create(entity: T, rowKeyValue?: string): Promise<T> {
//     logger.debug(`Inserting Entity in ${this.tableName}:`);

//     entity = AzureEntityMapper.createEntity<T>(entity, rowKeyValue);
//     // tslint:disable-next-line: no-console
//     console.table(entity);

//     const result = await this.manager.insertEntity<T>(this.tableName, entity);

//     logger.debug(`Entity stored successfuly`);
//     console.table(result, ['(index)', '$', '_']);
//     return AzureEntityMapper.serialize<T>(result);
//   }

//   async update(rowKey: string, entity: Partial<T>): Promise<T> {
//     logger.debug(`Inserting Entity in ${this.tableName}:`);

//     entity = AzureEntityMapper.createEntity<T>(entity, rowKey);

//     const result = await this.manager.replaceEntity(this.tableName, entity);

//     logger.debug(`Entity updated successfuly`);
//     // tslint:disable-next-line: no-console
//     console.table(entity);
//     return AzureEntityMapper.serialize<T>(result);
//   }

//   async delete(rowKey: string, entity: T): Promise<AzureCosmosDbResponse> {
//     entity = AzureEntityMapper.createEntity<T>(entity, rowKey);
//     const result = await this.manager.deleteEntity<T>(this.tableName, entity);

//     logger.debug(`Deleted Entity RowKey=${rowKey} in ${this.tableName} (${result.isSuccessful})`);
//     console.table(result, ['(index)', '$', '_']);
//     return result;
//   }
// }
