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

type GeoJsonTypes = 'Point' | 'Polygon' | 'LineStrings';

export type Position = number[]; // [number, number] | [number, number, number]; Longitude, Latitude

interface GeoJsonObject {
  type: GeoJsonTypes;
}

export class Point implements GeoJsonObject {
  type: 'Point' = 'Point' as const;
  coordinates: Position;
}

export class LineString implements GeoJsonObject {
  type: 'LineStrings' = 'LineStrings' as const;
  coordinates: Position[];
}

export class Polygon implements GeoJsonObject {
  type: 'Polygon' = 'Polygon' as const;
  coordinates: Position[][];
}
