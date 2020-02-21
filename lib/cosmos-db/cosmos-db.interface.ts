import { CosmosClientOptions } from '@azure/cosmos';
import { Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';

export interface AzureCosmosDbOptions extends CosmosClientOptions {
  dbName: string;
  retryAttempts?: number;
  retryDelay?: number;
  connectionName?: string;
}

export interface AzureCosmosDbOptionsFactory {
  createAzureCosmosDbOptions(): Promise<AzureCosmosDbOptions> | AzureCosmosDbOptions;
}

export interface AzureCosmosDbModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  connectionName?: string;
  useExisting?: Type<AzureCosmosDbOptionsFactory>;
  useClass?: Type<AzureCosmosDbOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<AzureCosmosDbOptions> | AzureCosmosDbOptions;
  inject?: any[];
}

export interface AzureCosmosRepository<T> {
  create(item: T): Promise<T>;
  upsert(item: T): Promise<T>;
  remove(id: string, partitionKeyValue: any): void;
  findAll(): Promise<T[]>;
  findById(id: string, partitionKeyValue: any): Promise<T>;
}

type GeoJsonTypes = 'Point' | 'Polygon' | 'LineStrings';

export type Position = number[]; // [number, number] | [number, number, number]; Longitude, Latitude

interface GeoJsonObject {
  type: GeoJsonTypes;
}

export class Point implements GeoJsonObject {
  type: 'Point' = 'Point';
  coordinates: Position;
}

export class LineString implements GeoJsonObject {
  type: 'LineStrings' = 'LineStrings';
  coordinates: Position[];
}

export class Polygon implements GeoJsonObject {
  type: 'Polygon' = 'Polygon';
  coordinates: Position[][];
}
