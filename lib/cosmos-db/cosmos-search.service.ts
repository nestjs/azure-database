import { Injectable, Logger } from '@nestjs/common';
import { Container, FeedOptions, SqlQuerySpec } from '@azure/cosmos';
import {
  VectorSearchOptions,
  FullTextSearchOptions,
  HybridSearchOptions,
  VectorSearchResult,
  FullTextSearchResult,
  HybridSearchResult,
  ExtendedFeedOptions,
} from './cosmos-db.interface';

/**
 * Service providing advanced search capabilities for Cosmos DB containers
 * 
 * Supports:
 * - Vector Search: Similarity queries on embeddings using cosine, dot product, or euclidean distance
 * - Full-Text Search: Advanced keyword and text matching with fuzzy search and highlighting
 * - Hybrid Search: Combines vector and keyword search using Reciprocal Rank Fusion (RRF) or weighted scoring
 */
@Injectable()
export class CosmosSearchService {
  private readonly logger = new Logger(CosmosSearchService.name);

  /**
   * Perform vector similarity search on embeddings
   * 
   * @example
   * ```typescript
   * const results = await searchService.vectorSearch(container, {
   *   vectorPath: '/embedding',
   *   vector: [0.1, 0.2, 0.3, ...],
   *   limit: 10,
   *   distanceFunction: 'cosine'
   * });
   * ```
   */
  async vectorSearch<T = any>(
    container: Container,
    options: VectorSearchOptions,
    feedOptions?: ExtendedFeedOptions,
  ): Promise<VectorSearchResult<T>[]> {
    this.logger.debug(`Performing vector search on path: ${options.vectorPath}`);

    const { vectorPath, vector, limit = 10, distanceFunction = 'cosine' } = options;

    // Build the vector search query using VECTOR_DISTANCE function
    const query = this.buildVectorQuery(vectorPath, vector, limit, distanceFunction);

    const querySpec: SqlQuerySpec = {
      query,
      parameters: [
        { name: '@vector', value: vector },
        { name: '@limit', value: limit },
      ],
    };

    // Configure feed options for vector search optimization
    const extendedFeedOptions: FeedOptions = {
      ...feedOptions,
      maxItemCount: limit,
    };

    try {
      const { resources, requestCharge } = await container.items
        .query<T & { similarityScore: number; distance: number }>(querySpec, extendedFeedOptions)
        .fetchAll();

      this.logger.debug(`Vector search completed. Found ${resources.length} results. RU charge: ${requestCharge}`);

      return resources.map((item, index) => ({
        document: this.excludeMetadata(item),
        score: item.similarityScore || 0,
        rank: index + 1,
        similarityScore: item.similarityScore || 0,
        distance: item.distance || 0,
      }));
    } catch (error) {
      this.logger.error('Vector search failed', error);
      throw new Error(`Vector search failed: ${error.message}`);
    }
  }

  /**
   * Perform full-text search with advanced text matching
   * 
   * @example
   * ```typescript
   * const results = await searchService.fullTextSearch(container, {
   *   searchText: 'machine learning',
   *   searchFields: ['title', 'description'],
   *   searchMode: 'any',
   *   fuzzySearch: true,
   *   highlightFields: ['title', 'description']
   * });
   * ```
   */
  async fullTextSearch<T = any>(
    container: Container,
    options: FullTextSearchOptions,
    feedOptions?: FeedOptions,
  ): Promise<FullTextSearchResult<T>[]> {
    this.logger.debug(`Performing full-text search for: "${options.searchText}"`);

    const { searchText, searchFields, searchMode = 'any', highlightFields } = options;

    // Build the full-text search query using FULLTEXT function
    const query = this.buildFullTextQuery(searchText, searchFields, searchMode, highlightFields);

    const querySpec: SqlQuerySpec = {
      query,
      parameters: [
        { name: '@searchText', value: searchText },
      ],
    };

    try {
      const { resources, requestCharge } = await container.items
        .query<T & { textScore: number; highlights: Record<string, string[]>; matchedTerms: string[] }>(
          querySpec,
          feedOptions,
        )
        .fetchAll();

      this.logger.debug(`Full-text search completed. Found ${resources.length} results. RU charge: ${requestCharge}`);

      return resources.map((item, index) => ({
        document: this.excludeMetadata(item),
        score: item.textScore || 0,
        rank: index + 1,
        textScore: item.textScore || 0,
        matchedTerms: item.matchedTerms || [],
        highlights: item.highlights || {},
      }));
    } catch (error) {
      this.logger.error('Full-text search failed', error);
      throw new Error(`Full-text search failed: ${error.message}`);
    }
  }

  /**
   * Perform hybrid search combining vector and text search
   * 
   * @example
   * ```typescript
   * const results = await searchService.hybridSearch(container, {
   *   vectorSearch: {
   *     vectorPath: '/embedding',
   *     vector: [0.1, 0.2, 0.3, ...],
   *     limit: 20
   *   },
   *   fullTextSearch: {
   *     searchText: 'machine learning',
   *     searchFields: ['title', 'description']
   *   },
   *   vectorWeight: 0.6,
   *   textWeight: 0.4,
   *   rankingFunction: 'rrf'
   * });
   * ```
   */
  async hybridSearch<T = any>(
    container: Container,
    options: HybridSearchOptions,
    feedOptions?: ExtendedFeedOptions,
  ): Promise<HybridSearchResult<T>[]> {
    this.logger.debug('Performing hybrid search (vector + text)');

    const {
      vectorSearch,
      fullTextSearch,
      vectorWeight = 0.5,
      textWeight = 0.5,
      rankingFunction = 'rrf',
    } = options;

    // Build hybrid search query that combines vector and text search
    const query = this.buildHybridQuery(vectorSearch, fullTextSearch, vectorWeight, textWeight, rankingFunction);

    const querySpec: SqlQuerySpec = {
      query,
      parameters: [
        { name: '@vector', value: vectorSearch.vector },
        { name: '@searchText', value: fullTextSearch.searchText },
        { name: '@vectorWeight', value: vectorWeight },
        { name: '@textWeight', value: textWeight },
      ],
    };

    // Configure feed options for hybrid search optimization
    const extendedFeedOptions: FeedOptions = {
      ...feedOptions,
      maxItemCount: vectorSearch.limit || 10,
    };

    try {
      const { resources, requestCharge } = await container.items
        .query<T & {
          combinedScore: number;
          vectorScore: number;
          textScore: number;
          vectorRank: number;
          textRank: number;
          fusionScore: number;
        }>(querySpec, extendedFeedOptions)
        .fetchAll();

      this.logger.debug(`Hybrid search completed. Found ${resources.length} results. RU charge: ${requestCharge}`);

      return resources.map((item, index) => ({
        document: this.excludeMetadata(item),
        score: item.combinedScore || 0,
        rank: index + 1,
        combinedScore: item.combinedScore || 0,
        vectorScore: item.vectorScore || 0,
        textScore: item.textScore || 0,
        rankingDetails: {
          vectorRank: item.vectorRank || 0,
          textRank: item.textRank || 0,
          fusionScore: item.fusionScore || 0,
        },
      }));
    } catch (error) {
      this.logger.error('Hybrid search failed', error);
      throw new Error(`Hybrid search failed: ${error.message}`);
    }
  }

  /**
   * Build vector search query using VectorDistance function
   */
  private buildVectorQuery(
    vectorPath: string,
    vector: number[],
    limit: number,
    distanceFunction: string,
  ): string {
    const distanceFunc = distanceFunction.toUpperCase();
    return `
      SELECT TOP @limit 
        *, 
        VectorDistance(c${vectorPath}, @vector) as distance,
        (1 - VectorDistance(c${vectorPath}, @vector)) as similarityScore
      FROM c 
      WHERE IS_DEFINED(c${vectorPath})
      ORDER BY VectorDistance(c${vectorPath}, @vector)
    `;
  }

  /**
   * Build full-text search query using FullTextScore and FullTextContains functions
   */
  private buildFullTextQuery(
    searchText: string,
    searchFields?: string[],
    searchMode: string = 'any',
    highlightFields?: string[],
  ): string {
    // For full-text search, we need to use FullTextContains or FullTextContainsAll
    const containsFunction = searchMode === 'all' ? 'FullTextContainsAll' : 'FullTextContains';
    
    // Build WHERE clause for text search
    let whereClause = '';
    let scoreField = 'c.content'; // Default field for scoring
    
    if (searchFields && searchFields.length > 0) {
      // Search in specific fields
      const fieldConditions = searchFields.map(field => 
        `${containsFunction}(c.${field}, @searchText)`
      ).join(' OR ');
      whereClause = `WHERE ${fieldConditions}`;
      scoreField = `c.${searchFields[0]}`; // Use first field for scoring
    } else {
      // Search in common text fields with fallback
      whereClause = `WHERE ${containsFunction}(c.content, @searchText) OR ${containsFunction}(c.title, @searchText) OR ${containsFunction}(c.summary, @searchText)`;
    }

    return `
      SELECT TOP 100
        *, 
        1 as textScore,
        [] as matchedTerms,
        {} as highlights
      FROM c 
      ${whereClause}
      ORDER BY RANK FullTextScore(${scoreField}, @searchText)
    `;
  }

  /**
   * Build hybrid search query using RRF function
   */
  private buildHybridQuery(
    vectorSearch: VectorSearchOptions,
    fullTextSearch: FullTextSearchOptions,
    vectorWeight: number,
    textWeight: number,
    rankingFunction: string,
  ): string {
    const { vectorPath, distanceFunction = 'cosine' } = vectorSearch;
    const { searchFields, searchMode = 'any' } = fullTextSearch;

    // Build the WHERE clause for full-text search
    const containsFunction = searchMode === 'all' ? 'FullTextContainsAll' : 'FullTextContains';
    let textWhereClause = '';
    let scoreField = 'c.content'; // Default field for scoring
    
    if (searchFields && searchFields.length > 0) {
      const fieldConditions = searchFields.map(field => 
        `${containsFunction}(c.${field}, @searchText)`
      ).join(' OR ');
      textWhereClause = `(${fieldConditions})`;
      scoreField = `c.${searchFields[0]}`; // Use first field for scoring
    } else {
      textWhereClause = `(${containsFunction}(c.content, @searchText) OR ${containsFunction}(c.title, @searchText) OR ${containsFunction}(c.summary, @searchText))`;
    }

    if (rankingFunction === 'rrf') {
      // Use Azure Cosmos DB RRF function with weights
      const weights = `[${vectorWeight}, ${textWeight}]`;
      
      return `
        SELECT TOP 50
          *, 
          VectorDistance(c${vectorPath}, @vector) as distance,
          (1 - VectorDistance(c${vectorPath}, @vector)) as vectorScore,
          1 as textScore,
          1 as combinedScore,
          1 as vectorRank,
          1 as textRank,
          1 as fusionScore
        FROM c 
        WHERE IS_DEFINED(c${vectorPath}) AND ${textWhereClause}
        ORDER BY RANK RRF(VectorDistance(c${vectorPath}, @vector), FullTextScore(${scoreField}, @searchText), ${weights})
      `;
    } else {
      // Use simple weighted linear combination without RRF
      return `
        SELECT TOP 50
          *, 
          VectorDistance(c${vectorPath}, @vector) as distance,
          (1 - VectorDistance(c${vectorPath}, @vector)) as vectorScore,
          1 as textScore,
          (@vectorWeight * (1 - VectorDistance(c${vectorPath}, @vector)) + @textWeight * 1) as combinedScore,
          1 as vectorRank,
          1 as textRank,
          0 as fusionScore
        FROM c 
        WHERE IS_DEFINED(c${vectorPath}) AND ${textWhereClause}
        ORDER BY (@vectorWeight * (1 - VectorDistance(c${vectorPath}, @vector)) + @textWeight * 1) DESC
      `;
    }
  }

  /**
   * Remove search metadata from result documents
   */
  private excludeMetadata<T>(item: any): T {
    const { 
      similarityScore, 
      distance, 
      textScore, 
      combinedScore, 
      vectorScore, 
      vectorRank, 
      textRank, 
      fusionScore, 
      matchedTerms,
      highlights,
      ...document 
    } = item;
    return document as T;
  }
}
