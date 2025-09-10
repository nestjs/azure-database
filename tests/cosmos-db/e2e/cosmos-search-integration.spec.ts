import { Test, TestingModule } from '@nestjs/testing';
import { AzureCosmosDbModule, CosmosSearchService } from '../../../lib';
import { Article } from '../services/entities';

describe('Cosmos DB Search Integration', () => {
  let moduleRef: TestingModule;
  let searchService: CosmosSearchService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        AzureCosmosDbModule.forRoot({
          dbName: process.env['COSMOS_DB_NAME'] || 'nest-cosmos-db',
          endpoint: process.env['COSMOS_DB_ENDPOINT'] || 'https://localhost:8081',
          key: process.env['COSMOS_DB_KEY'] || 'dummyKey',
          retryAttempts: 1,
          retryDelay: 1000,
        }),
        AzureCosmosDbModule.forFeature([{ dto: Article }]),
      ],
    }).compile();

    searchService = moduleRef.get<CosmosSearchService>(CosmosSearchService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  it('should be defined', () => {
    expect(moduleRef).toBeDefined();
    expect(searchService).toBeDefined();
  });

  describe('vector search', () => {
    it('should perform vector similarity search', async () => {
      // This test would require a real Cosmos DB instance with vector indexing enabled
      // For now, we'll skip it in the test environment
      expect(searchService.vectorSearch).toBeDefined();
    });
  });

  describe('full-text search', () => {
    it('should perform full-text search', async () => {
      // This test would require a real Cosmos DB instance with full-text indexing enabled
      // For now, we'll skip it in the test environment
      expect(searchService.fullTextSearch).toBeDefined();
    });
  });

  describe('hybrid search', () => {
    it('should perform hybrid search', async () => {
      // This test would require a real Cosmos DB instance with both vector and full-text indexing enabled
      // For now, we'll skip it in the test environment
      expect(searchService.hybridSearch).toBeDefined();
    });
  });
});
