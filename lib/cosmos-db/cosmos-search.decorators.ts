import 'reflect-metadata';

/**
 * Metadata key for vector search configuration
 */
export const VECTOR_SEARCH_METADATA_KEY = 'vectorSearch';

/**
 * Metadata key for full-text search configuration
 */
export const FULLTEXT_SEARCH_METADATA_KEY = 'fullTextSearch';

/**
 * Configuration for vector embeddings on a property
 */
export interface VectorEmbeddingConfig {
  /** Data type of the vector elements */
  dataType?: 'float32' | 'uint8' | 'int8';
  /** Number of dimensions in the vector */
  dimensions: number;
  /** Distance function for similarity calculations */
  distanceFunction?: 'cosine' | 'dotproduct' | 'euclidean';
  /** Vector index type for optimization */
  indexType?: 'flat' | 'quantizedFlat' | 'diskANN';
}

/**
 * Configuration for full-text search on a property
 */
export interface FullTextConfig {
  /** Whether this field should be included in full-text search */
  searchable?: boolean;
  /** Whether this field should be highlighted in search results */
  highlightable?: boolean;
  /** Analyzer to use for text processing */
  analyzer?: 'standard' | 'keyword' | 'simple';
  /** Weight of this field in text relevance scoring */
  weight?: number;
}

/**
 * Decorator to mark a property as a vector embedding for similarity search
 * 
 * @example
 * ```typescript
 * export class Article {
 *   @VectorEmbedding({
 *     dimensions: 1536,
 *     distanceFunction: 'cosine',
 *     indexType: 'flat'
 *   })
 *   embedding: number[];
 * }
 * ```
 */
export function VectorEmbedding(config: VectorEmbeddingConfig): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const existingMetadata = Reflect.getMetadata(VECTOR_SEARCH_METADATA_KEY, target) || {};
    existingMetadata[propertyKey] = config;
    Reflect.defineMetadata(VECTOR_SEARCH_METADATA_KEY, existingMetadata, target);
  };
}

/**
 * Decorator to mark a property for full-text search capabilities
 * 
 * @example
 * ```typescript
 * export class Article {
 *   @FullTextSearchable({
 *     searchable: true,
 *     highlightable: true,
 *     weight: 2.0
 *   })
 *   title: string;
 * 
 *   @FullTextSearchable({
 *     searchable: true,
 *     highlightable: false,
 *     weight: 1.0
 *   })
 *   content: string;
 * }
 * ```
 */
export function FullTextSearchable(config: FullTextConfig = {}): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const existingMetadata = Reflect.getMetadata(FULLTEXT_SEARCH_METADATA_KEY, target) || {};
    existingMetadata[propertyKey] = { searchable: true, ...config };
    Reflect.defineMetadata(FULLTEXT_SEARCH_METADATA_KEY, existingMetadata, target);
  };
}

/**
 * Get vector embedding metadata for a class
 */
export function getVectorEmbeddingMetadata(target: any): Record<string, VectorEmbeddingConfig> {
  return Reflect.getMetadata(VECTOR_SEARCH_METADATA_KEY, target) || {};
}

/**
 * Get full-text search metadata for a class
 */
export function getFullTextSearchMetadata(target: any): Record<string, FullTextConfig> {
  return Reflect.getMetadata(FULLTEXT_SEARCH_METADATA_KEY, target) || {};
}

/**
 * Helper to get searchable field names from a class
 */
export function getSearchableFields(target: any): string[] {
  const metadata = getFullTextSearchMetadata(target);
  return Object.entries(metadata)
    .filter(([, config]) => config.searchable)
    .map(([fieldName]) => fieldName);
}

/**
 * Helper to get highlightable field names from a class
 */
export function getHighlightableFields(target: any): string[] {
  const metadata = getFullTextSearchMetadata(target);
  return Object.entries(metadata)
    .filter(([, config]) => config.highlightable)
    .map(([fieldName]) => fieldName);
}

/**
 * Helper to get vector field names from a class
 */
export function getVectorFields(target: any): string[] {
  const metadata = getVectorEmbeddingMetadata(target);
  return Object.keys(metadata);
}

/**
 * Get vector embedding configuration for a specific property
 */
export function getVectorEmbeddingConfig(
  target: any,
  propertyKey: string | symbol,
): VectorEmbeddingConfig | undefined {
  const metadata = getVectorEmbeddingMetadata(target);
  return metadata[propertyKey as string];
}

/**
 * Get full-text search configuration for a specific property
 */
export function getFullTextConfig(
  target: any,
  propertyKey: string | symbol,
): FullTextConfig | undefined {
  const metadata = getFullTextSearchMetadata(target);
  return metadata[propertyKey as string];
}
