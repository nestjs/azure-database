import { CosmosSearchService } from '../../lib/cosmos-db/cosmos-search.service';
import { VectorSearchOptions, FullTextSearchOptions, HybridSearchOptions } from '../../lib/cosmos-db/cosmos-db.interface';

describe('CosmosSearchService', () => {
  let service: CosmosSearchService;
  let mockContainer: any;

  beforeEach(() => {
    // Create a mock container
    mockContainer = {
      items: {
        query: jest.fn().mockReturnValue({
          fetchAll: jest.fn(),
        }),
      },
    };

    service = new CosmosSearchService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('vectorSearch', () => {
    it('should perform vector search with default options', async () => {
      const mockResults = [
        {
          id: '1',
          title: 'Test Document 1',
          embedding: [0.1, 0.2, 0.3],
          similarityScore: 0.95,
          distance: 0.05,
        },
        {
          id: '2', 
          title: 'Test Document 2',
          embedding: [0.2, 0.3, 0.4],
          similarityScore: 0.85,
          distance: 0.15,
        },
      ];

      mockContainer.items.query().fetchAll.mockResolvedValue({
        resources: mockResults,
        requestCharge: 2.5,
      });

      const options: VectorSearchOptions = {
        vectorPath: '/embedding',
        vector: [0.1, 0.2, 0.3],
        limit: 10,
      };

      const results = await service.vectorSearch(mockContainer, options);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        document: { id: '1', title: 'Test Document 1', embedding: [0.1, 0.2, 0.3] },
        score: 0.95,
        rank: 1,
        similarityScore: 0.95,
        distance: 0.05,
      });

      expect(mockContainer.items.query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringContaining('VECTOR_DISTANCE'),
          parameters: expect.arrayContaining([
            { name: '@vector', value: [0.1, 0.2, 0.3] },
            { name: '@limit', value: 10 },
          ]),
        }),
        expect.objectContaining({
          maxItemCount: 10,
        }),
      );
    });

    it('should handle different distance functions', async () => {
      mockContainer.items.query().fetchAll.mockResolvedValue({
        resources: [],
        requestCharge: 1.0,
      });

      const options: VectorSearchOptions = {
        vectorPath: '/embedding',
        vector: [0.1, 0.2, 0.3],
        distanceFunction: 'dotproduct',
      };

      await service.vectorSearch(mockContainer, options);

      expect(mockContainer.items.query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringContaining('DOTPRODUCT'),
        }),
        expect.any(Object),
      );
    });

    it('should handle errors gracefully', async () => {
      mockContainer.items.query().fetchAll.mockRejectedValue(new Error('Database error'));

      const options: VectorSearchOptions = {
        vectorPath: '/embedding',
        vector: [0.1, 0.2, 0.3],
      };

      await expect(service.vectorSearch(mockContainer, options)).rejects.toThrow('Vector search failed: Database error');
    });
  });

  describe('fullTextSearch', () => {
    it('should perform full-text search with default options', async () => {
      const mockResults = [
        {
          id: '1',
          title: 'Machine Learning Tutorial',
          content: 'This is a comprehensive guide to machine learning',
          textScore: 0.95,
          matchedTerms: ['machine', 'learning'],
          highlights: {
            title: ['<em>Machine Learning</em> Tutorial'],
            content: ['comprehensive guide to <em>machine learning</em>'],
          },
        },
      ];

      mockContainer.items.query().fetchAll.mockResolvedValue({
        resources: mockResults,
        requestCharge: 3.2,
      });

      const options: FullTextSearchOptions = {
        searchText: 'machine learning',
        searchFields: ['title', 'content'],
        highlightFields: ['title', 'content'],
      };

      const results = await service.fullTextSearch(mockContainer, options);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        document: {
          id: '1',
          title: 'Machine Learning Tutorial',
          content: 'This is a comprehensive guide to machine learning',
        },
        score: 0.95,
        rank: 1,
        textScore: 0.95,
        matchedTerms: ['machine', 'learning'],
        highlights: {
          title: ['<em>Machine Learning</em> Tutorial'],
          content: ['comprehensive guide to <em>machine learning</em>'],
        },
      });

      expect(mockContainer.items.query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringContaining('FULLTEXT'),
          parameters: expect.arrayContaining([
            { name: '@searchText', value: 'machine learning' },
          ]),
        }),
        undefined,
      );
    });

    it('should handle search mode configuration', async () => {
      mockContainer.items.query().fetchAll.mockResolvedValue({
        resources: [],
        requestCharge: 1.0,
      });

      const options: FullTextSearchOptions = {
        searchText: 'machine learning',
        searchMode: 'all',
      };

      await service.fullTextSearch(mockContainer, options);

      expect(mockContainer.items.query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringContaining('AND'),
        }),
        undefined,
      );
    });
  });

  describe('hybridSearch', () => {
    it('should perform hybrid search with RRF ranking', async () => {
      const mockResults = [
        {
          id: '1',
          title: 'AI and Machine Learning',
          embedding: [0.1, 0.2, 0.3],
          combinedScore: 0.92,
          vectorScore: 0.88,
          textScore: 0.95,
          vectorRank: 2,
          textRank: 1,
          fusionScore: 0.92,
        },
      ];

      mockContainer.items.query().fetchAll.mockResolvedValue({
        resources: mockResults,
        requestCharge: 4.5,
      });

      const options: HybridSearchOptions = {
        vectorSearch: {
          vectorPath: '/embedding',
          vector: [0.1, 0.2, 0.3],
          limit: 10,
        },
        fullTextSearch: {
          searchText: 'machine learning',
          searchFields: ['title', 'content'],
        },
        vectorWeight: 0.6,
        textWeight: 0.4,
        rankingFunction: 'rrf',
      };

      const results = await service.hybridSearch(mockContainer, options);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        document: {
          id: '1',
          title: 'AI and Machine Learning',
          embedding: [0.1, 0.2, 0.3],
        },
        score: 0.92,
        rank: 1,
        combinedScore: 0.92,
        vectorScore: 0.88,
        textScore: 0.95,
        rankingDetails: {
          vectorRank: 2,
          textRank: 1,
          fusionScore: 0.92,
        },
      });

      expect(mockContainer.items.query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.stringContaining('RRF'),
          parameters: expect.arrayContaining([
            { name: '@vector', value: [0.1, 0.2, 0.3] },
            { name: '@searchText', value: 'machine learning' },
            { name: '@vectorWeight', value: 0.6 },
            { name: '@textWeight', value: 0.4 },
          ]),
        }),
        expect.objectContaining({
          maxItemCount: 10,
        }),
      );
    });

    it('should use weighted linear combination when not using RRF', async () => {
      mockContainer.items.query().fetchAll.mockResolvedValue({
        resources: [],
        requestCharge: 1.0,
      });

      const options: HybridSearchOptions = {
        vectorSearch: {
          vectorPath: '/embedding',
          vector: [0.1, 0.2, 0.3],
        },
        fullTextSearch: {
          searchText: 'machine learning',
        },
        rankingFunction: 'weighted',
      };

      await service.hybridSearch(mockContainer, options);

      expect(mockContainer.items.query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.not.stringContaining('RRF'),
        }),
        expect.any(Object),
      );
    });
  });

  describe('query building', () => {
    it('should build vector query with correct syntax', () => {
      const query = (service as any).buildVectorQuery('/embedding', [0.1, 0.2], 5, 'cosine');
      
      expect(query).toContain('VECTOR_DISTANCE(c/embedding, @vector, \'COSINE\')');
      expect(query).toContain('TOP @limit');
      expect(query).toContain('ORDER BY VECTOR_DISTANCE');
      expect(query).toContain('IS_DEFINED(c/embedding)');
    });

    it('should build full-text query with highlighting', () => {
      const query = (service as any).buildFullTextQuery(
        'test search',
        ['title', 'content'],
        'any',
        ['title']
      );
      
      expect(query).toContain('FULLTEXT(c.title, c.content, @searchText, \'OR\')');
      expect(query).toContain('FULLTEXT_SCORE()');
      expect(query).toContain('FULLTEXT_HIGHLIGHT(c.title, @searchText)');
    });

    it('should build hybrid query with RRF', () => {
      const vectorOptions = { vectorPath: '/embedding', distanceFunction: 'cosine' as const };
      const textOptions = { searchFields: ['title'], searchMode: 'any' as const };
      
      const query = (service as any).buildHybridQuery(
        vectorOptions,
        textOptions,
        0.6,
        0.4,
        'rrf'
      );
      
      expect(query).toContain('RRF(');
      expect(query).toContain('VECTOR_DISTANCE');
      expect(query).toContain('FULLTEXT_SCORE');
      expect(query).toContain('@vectorWeight');
      expect(query).toContain('@textWeight');
    });
  });

  describe('metadata exclusion', () => {
    it('should exclude search metadata from documents', () => {
      const itemWithMetadata = {
        id: '1',
        title: 'Test',
        similarityScore: 0.95,
        distance: 0.05,
        textScore: 0.88,
        combinedScore: 0.91,
        vectorScore: 0.95,
        vectorRank: 1,
        textRank: 2,
        fusionScore: 0.91,
        matchedTerms: ['test'],
        highlights: { title: ['<em>Test</em>'] },
      };

      const cleaned = (service as any).excludeMetadata(itemWithMetadata);

      expect(cleaned).toEqual({
        id: '1',
        title: 'Test',
      });

      expect(cleaned).not.toHaveProperty('similarityScore');
      expect(cleaned).not.toHaveProperty('textScore');
      expect(cleaned).not.toHaveProperty('combinedScore');
    });
  });
});
