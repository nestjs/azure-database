import { CosmosClientOptions, FeedOptions } from '@azure/cosmos';
import { Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';

export interface AzureCosmosDbOptions extends CosmosClientOptions {
  dbName: string;
  retryAttempts?: number;
  retryDelay?: number;
  connectionName?: string;
}

/**
 * Vector search configuration for similarity queries on embeddings
 */
export interface VectorSearchOptions {
  /** The vector field path to search against */
  vectorPath: string;
  /** The query vector for similarity search */
  vector: number[];
  /** Number of similar vectors to return */
  limit?: number;
  /** Similarity threshold (0-1) */
  similarityThreshold?: number;
  /** Distance function to use for vector similarity */
  distanceFunction?: 'cosine' | 'dotproduct' | 'euclidean';
}

/**
 * Full-text search configuration for keyword and text matching
 */
export interface FullTextSearchOptions {
  /** The text to search for */
  searchText: string;
  /** Fields to search in. If not specified, searches all text fields */
  searchFields?: string[];
  /** Search mode: 'any' matches any term, 'all' requires all terms */
  searchMode?: 'any' | 'all';
  /** Enable fuzzy matching for typos */
  fuzzySearch?: boolean;
  /** Highlight matched terms in results */
  highlightFields?: string[];
}

/**
 * Hybrid search configuration combining vector and text search
 */
export interface HybridSearchOptions {
  /** Vector search configuration */
  vectorSearch: VectorSearchOptions;
  /** Full-text search configuration */
  fullTextSearch: FullTextSearchOptions;
  /** Weight for vector search results (0-1, default 0.5) */
  vectorWeight?: number;
  /** Weight for text search results (0-1, default 0.5) */
  textWeight?: number;
  /** Ranking function for combining results */
  rankingFunction?: 'rrf' | 'weighted' | 'linear';
}

/**
 * Extended feed options that include search capabilities
 */
export interface ExtendedFeedOptions extends FeedOptions {
  /** Enable vector search buffer optimization */
  vectorSearchBufferSize?: number;
  /** Allow unbounded vector search queries */
  allowUnboundedVectorQueries?: boolean;
  /** Disable hybrid search query plan optimization */
  disableHybridSearchQueryPlanOptimization?: boolean;
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

/**
 * Search result with relevance scoring
 */
export interface SearchResult<T = any> {
  /** The document data */
  document: T;
  /** Relevance score (0-1) */
  score: number;
  /** Rank position in results */
  rank?: number;
  /** Search highlights for matched terms */
  highlights?: Record<string, string[]>;
}

/**
 * Vector search result with similarity scoring
 */
export interface VectorSearchResult<T = any> extends SearchResult<T> {
  /** Vector similarity score */
  similarityScore: number;
  /** Distance from query vector */
  distance?: number;
}

/**
 * Full-text search result with text relevance
 */
export interface FullTextSearchResult<T = any> extends SearchResult<T> {
  /** Text relevance score */
  textScore: number;
  /** Matched terms */
  matchedTerms?: string[];
}

/**
 * Hybrid search result combining vector and text scores
 */
export interface HybridSearchResult<T = any> extends SearchResult<T> {
  /** Combined relevance score */
  combinedScore: number;
  /** Vector similarity score */
  vectorScore: number;
  /** Text relevance score */
  textScore: number;
  /** Ranking details */
  rankingDetails?: {
    vectorRank: number;
    textRank: number;
    fusionScore: number;
  };
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
