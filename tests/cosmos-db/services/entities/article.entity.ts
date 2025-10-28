import { CosmosPartitionKey, VectorEmbedding, FullTextSearchable } from '../../../../lib';

@CosmosPartitionKey('id')
export class Article {
  id?: string;

  @FullTextSearchable({
    searchable: true,
    highlightable: true,
    weight: 2.0,
  })
  title: string;

  @FullTextSearchable({
    searchable: true,
    highlightable: true,
    weight: 1.0,
  })
  content: string;

  @FullTextSearchable({
    searchable: true,
    highlightable: false,
    weight: 0.5,
  })
  category: string;

  @VectorEmbedding({
    dimensions: 1536,
    distanceFunction: 'cosine',
    indexType: 'flat',
  })
  embedding: number[];

  @VectorEmbedding({
    dimensions: 768,
    distanceFunction: 'dotproduct',
    indexType: 'quantizedFlat',
  })
  titleEmbedding: number[];

  author: string;
  publishedAt: Date;
  tags: string[];
}
