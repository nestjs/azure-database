import 'reflect-metadata';
import { VectorEmbedding, FullTextSearchable, getVectorEmbeddingConfig, getFullTextConfig } from '../../lib/cosmos-db/cosmos-search.decorators';

describe('Search Decorators', () => {
  describe('@VectorEmbedding', () => {
    it('should store vector embedding metadata', () => {
      class TestEntity {
        @VectorEmbedding({
          dimensions: 384,
          distanceFunction: 'cosine',
          indexType: 'diskANN'
        })
        embedding!: number[];
      }

      const config = getVectorEmbeddingConfig(TestEntity, 'embedding');
      
      expect(config).toEqual({
        dimensions: 384,
        distanceFunction: 'cosine',
        indexType: 'diskANN'
      });
    });

    it('should use default configuration when none provided', () => {
      class TestEntity {
        @VectorEmbedding()
        embedding!: number[];
      }

      const config = getVectorEmbeddingConfig(TestEntity, 'embedding');
      
      expect(config).toEqual({
        dimensions: 1536,
        distanceFunction: 'cosine',
        indexType: 'diskANN'
      });
    });

    it('should return undefined for non-decorated properties', () => {
      class TestEntity {
        embedding!: number[];
      }

      const config = getVectorEmbeddingConfig(TestEntity, 'embedding');
      
      expect(config).toBeUndefined();
    });
  });

  describe('@FullTextSearchable', () => {
    it('should store full-text search metadata', () => {
      class TestEntity {
        @FullTextSearchable({
          weight: 2.0,
          searchable: true,
          highlightable: true
        })
        title!: string;
      }

      const config = getFullTextConfig(TestEntity, 'title');
      
      expect(config).toEqual({
        weight: 2.0,
        searchable: true,
        highlightable: true
      });
    });

    it('should use default configuration when none provided', () => {
      class TestEntity {
        @FullTextSearchable()
        content!: string;
      }

      const config = getFullTextConfig(TestEntity, 'content');
      
      expect(config).toEqual({
        weight: 1.0,
        searchable: true,
        highlightable: false
      });
    });

    it('should return undefined for non-decorated properties', () => {
      class TestEntity {
        content!: string;
      }

      const config = getFullTextConfig(TestEntity, 'content');
      
      expect(config).toBeUndefined();
    });
  });

  describe('Multiple decorators on entity', () => {
    it('should handle multiple decorated properties', () => {
      class Article {
        @VectorEmbedding({
          dimensions: 512,
          distanceFunction: 'dotproduct'
        })
        embedding!: number[];

        @FullTextSearchable({
          weight: 2.0,
          highlightable: true
        })
        title!: string;

        @FullTextSearchable({
          weight: 1.0,
          highlightable: true
        })
        content!: string;

        category!: string; // not decorated
      }

      const embeddingConfig = getVectorEmbeddingConfig(Article, 'embedding');
      const titleConfig = getFullTextConfig(Article, 'title');
      const contentConfig = getFullTextConfig(Article, 'content');
      const categoryConfig = getFullTextConfig(Article, 'category');

      expect(embeddingConfig).toEqual({
        dimensions: 512,
        distanceFunction: 'dotproduct',
        indexType: 'diskANN'
      });

      expect(titleConfig).toEqual({
        weight: 2.0,
        searchable: true,
        highlightable: true
      });

      expect(contentConfig).toEqual({
        weight: 1.0,
        searchable: true,
        highlightable: true
      });

      expect(categoryConfig).toBeUndefined();
    });
  });
});
