import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/azure-database';
import { Container } from '@azure/cosmos';
import { CosmosSearchService } from '../../../lib';
import { Article } from './entities';
import { 
  VectorSearchOptions, 
  FullTextSearchOptions, 
  HybridSearchOptions,
  VectorSearchResult,
  FullTextSearchResult,
  HybridSearchResult,
} from '../../../lib/cosmos-db/cosmos-db.interface';

/**
 * Service demonstrating advanced search capabilities for articles
 * 
 * This service showcases:
 * - Vector similarity search for finding semantically similar articles
 * - Full-text search for keyword-based article discovery
 * - Hybrid search combining semantic and keyword relevance
 */
@Injectable()
export class ArticleSearchService {
  constructor(
    @InjectModel(Article)
    private readonly articleContainer: Container,
    private readonly searchService: CosmosSearchService,
  ) {}

  /**
   * Find articles similar to a given embedding vector
   * 
   * @example
   * ```typescript
   * const similarArticles = await articleService.findSimilarArticles(
   *   [0.1, 0.2, 0.3, ...], // embedding from title/content
   *   { limit: 10, threshold: 0.8 }
   * );
   * ```
   */
  async findSimilarArticles(
    queryEmbedding: number[],
    options: {
      limit?: number;
      threshold?: number;
      useContentEmbedding?: boolean;
    } = {},
  ): Promise<VectorSearchResult<Article>[]> {
    const { limit = 10, threshold = 0.7, useContentEmbedding = true } = options;
    
    const vectorOptions: VectorSearchOptions = {
      vectorPath: useContentEmbedding ? '/embedding' : '/titleEmbedding',
      vector: queryEmbedding,
      limit,
      similarityThreshold: threshold,
      distanceFunction: useContentEmbedding ? 'cosine' : 'dotproduct',
    };

    return this.searchService.vectorSearch<Article>(this.articleContainer, vectorOptions);
  }

  /**
   * Search articles using full-text search
   * 
   * @example
   * ```typescript
   * const articles = await articleService.searchArticles('machine learning AI', {
   *   searchInTitle: true,
   *   searchInContent: true,
   *   fuzzySearch: true,
   *   highlightMatches: true
   * });
   * ```
   */
  async searchArticles(
    searchText: string,
    options: {
      searchInTitle?: boolean;
      searchInContent?: boolean;
      searchInCategory?: boolean;
      fuzzySearch?: boolean;
      highlightMatches?: boolean;
      searchMode?: 'any' | 'all';
    } = {},
  ): Promise<FullTextSearchResult<Article>[]> {
    const {
      searchInTitle = true,
      searchInContent = true,
      searchInCategory = false,
      fuzzySearch = false,
      highlightMatches = false,
      searchMode = 'any',
    } = options;

    const searchFields: string[] = [];
    if (searchInTitle) searchFields.push('title');
    if (searchInContent) searchFields.push('content');
    if (searchInCategory) searchFields.push('category');

    const highlightFields = highlightMatches ? searchFields : undefined;

    const textOptions: FullTextSearchOptions = {
      searchText,
      searchFields,
      searchMode,
      fuzzySearch,
      highlightFields,
    };

    return this.searchService.fullTextSearch<Article>(this.articleContainer, textOptions);
  }

  /**
   * Perform hybrid search combining semantic similarity and keyword matching
   * 
   * @example
   * ```typescript
   * const results = await articleService.hybridSearch(
   *   'machine learning tutorial',
   *   [0.1, 0.2, 0.3, ...], // embedding
   *   {
   *     semanticWeight: 0.6,
   *     keywordWeight: 0.4,
   *     maxResults: 20
   *   }
   * );
   * ```
   */
  async hybridSearch(
    searchText: string,
    queryEmbedding: number[],
    options: {
      semanticWeight?: number;
      keywordWeight?: number;
      maxResults?: number;
      highlightMatches?: boolean;
      useRRF?: boolean;
    } = {},
  ): Promise<HybridSearchResult<Article>[]> {
    const {
      semanticWeight = 0.5,
      keywordWeight = 0.5,
      maxResults = 10,
      highlightMatches = true,
      useRRF = true,
    } = options;

    const hybridOptions: HybridSearchOptions = {
      vectorSearch: {
        vectorPath: '/embedding',
        vector: queryEmbedding,
        limit: maxResults * 2, // Get more candidates for reranking
        distanceFunction: 'cosine',
      },
      fullTextSearch: {
        searchText,
        searchFields: ['title', 'content', 'category'],
        searchMode: 'any',
        highlightFields: highlightMatches ? ['title', 'content'] : undefined,
      },
      vectorWeight: semanticWeight,
      textWeight: keywordWeight,
      rankingFunction: useRRF ? 'rrf' : 'weighted',
    };

    const results = await this.searchService.hybridSearch<Article>(
      this.articleContainer,
      hybridOptions,
    );

    // Return only the requested number of results
    return results.slice(0, maxResults);
  }

  /**
   * Search for articles by category with semantic similarity
   * 
   * @example
   * ```typescript
   * const techArticles = await articleService.searchByCategory(
   *   'technology',
   *   [0.1, 0.2, 0.3, ...], // category embedding
   *   { limit: 15, includeSubtopics: true }
   * );
   * ```
   */
  async searchByCategory(
    category: string,
    categoryEmbedding?: number[],
    options: {
      limit?: number;
      includeSubtopics?: boolean;
      semanticBoost?: number;
    } = {},
  ): Promise<(VectorSearchResult<Article> | FullTextSearchResult<Article>)[]> {
    const { limit = 10, includeSubtopics = false, semanticBoost = 1.0 } = options;

    if (categoryEmbedding && semanticBoost > 0) {
      // Use hybrid search if embedding is provided
      return this.hybridSearch(category, categoryEmbedding, {
        semanticWeight: 0.3 * semanticBoost,
        keywordWeight: 0.7,
        maxResults: limit,
        highlightMatches: false,
      });
    } else {
      // Use text search only
      const searchMode = includeSubtopics ? 'any' : 'all';
      return this.searchArticles(category, {
        searchInCategory: true,
        searchInTitle: includeSubtopics,
        searchInContent: false,
        searchMode,
      });
    }
  }

  /**
   * Get article recommendations based on user reading history
   * 
   * @example
   * ```typescript
   * const recommendations = await articleService.getRecommendations(
   *   ['article1', 'article2'], // user's read articles
   *   { count: 10, diversityBoost: 0.2 }
   * );
   * ```
   */
  async getRecommendations(
    readArticleIds: string[],
    options: {
      count?: number;
      diversityBoost?: number;
      excludeReadArticles?: boolean;
    } = {},
  ): Promise<VectorSearchResult<Article>[]> {
    const { count = 5, diversityBoost = 0.1, excludeReadArticles = true } = options;

    // Get embeddings of read articles
    const readArticles = await Promise.all(
      readArticleIds.map(id => this.articleContainer.item(id).read<Article>())
    );

    // Calculate average embedding from read articles
    const validEmbeddings = readArticles
      .map(response => response.resource?.embedding)
      .filter((embedding): embedding is number[] => embedding != null);

    if (validEmbeddings.length === 0) {
      throw new Error('No valid embeddings found in read articles');
    }

    // Calculate centroid embedding
    const dimensions = validEmbeddings[0].length;
    const centroidEmbedding = new Array(dimensions).fill(0);

    for (const embedding of validEmbeddings) {
      for (let i = 0; i < dimensions; i++) {
        centroidEmbedding[i] += embedding[i] / validEmbeddings.length;
      }
    }

    // Add diversity boost by slightly randomizing the centroid
    if (diversityBoost > 0) {
      for (let i = 0; i < dimensions; i++) {
        const noise = (Math.random() - 0.5) * diversityBoost;
        centroidEmbedding[i] += noise;
      }
    }

    // Find similar articles
    const similarArticles = await this.findSimilarArticles(centroidEmbedding, {
      limit: excludeReadArticles ? count + readArticleIds.length : count,
      threshold: 0.5,
    });

    // Filter out already read articles if requested
    if (excludeReadArticles) {
      const filtered = similarArticles.filter(
        result => !readArticleIds.includes(result.document.id!)
      );
      return filtered.slice(0, count);
    }

    return similarArticles.slice(0, count);
  }
}
