<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#5" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec"><img src="https://img.shields.io/badge/Donate-PayPal-dc3d53.svg"/></a>
  <a href="https://twitter.com/nestframework"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Azure Database ([Table Storage](http://bit.ly/nest_azure-storage-table), [Cosmos DB - NoSQL](https://azure.microsoft.com/en-us/services/cosmos-db/)) module for [Nest](https://github.com/nestjs/nest) framework (node.js)

## Disclaimer

You are reading the documentation for version 3. If you are looking for version 2 documentation, [click here](https://github.com/nestjs/azure-database/tree/legacy-v2). Please also note that version 2 is no longer maintained and will not receive any updates!

## Quick Start for Windows Users

If you're contributing to this project on Windows, you may encounter PowerShell execution policy issues. Here's how to fix them:

### Quick Fix (Recommended)

Run this command in PowerShell as Administrator:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Alternative Solutions

If you encounter issues:
- Use Command Prompt instead of PowerShell
- Use Git Bash (if installed)
- Use PowerShell Core (pwsh) instead of Windows PowerShell

## 🚀 Try the Search Features Sample

Want to see vector search, full-text search, and hybrid search in action? Check out our comprehensive sample application:

```bash
# Navigate to the enhanced cosmos-db sample with search features
cd sample/cosmos-db

# Install dependencies
npm install

# Start the sample application
npm run start:dev
```

Visit http://localhost:3000/events to explore the Event API with search capabilities.

### 🧪 Test Against Cosmos DB Emulator

For local testing of all Cosmos DB features including the new search capabilities, see our comprehensive emulator testing guide:
- [COSMOSDB_EMULATOR_TESTING.md](./COSMOSDB_EMULATOR_TESTING.md) - Complete guide for testing all Cosmos DB features

```bash
# Run emulator integration tests
npm test tests/cosmos-db/event-search-emulator.integration.spec.ts
```

## Before Installation

For Cosmos DB (NoSQL ONLY)

1. Create a Cosmos DB account and resource ([read more](https://learn.microsoft.com/azure/cosmos-db/nosql/quickstart-portal))
2. Note down the "URI", Database name and the "Primary Key" (or "Secondary Key") - You will need them later

For Table Storage

1. Create a Storage account and resource ([read more](https://learn.microsoft.com/azure/storage/tables/table-storage-quickstart-portal))
2. Note down the "Connection string" - You will need it later

## Installation

```bash
$ npm i --save @nestjs/azure-database
```

## Usage

### For Azure Cosmos DB support

1. Create or update your existing `.env` file with the following content:

```
AZURE_COSMOS_DB_NAME=
AZURE_COSMOS_DB_ENDPOINT=
AZURE_COSMOS_DB_KEY=
```

2. **IMPORTANT: Make sure to add your `.env` file to your .gitignore! The `.env` file MUST NOT be versioned on Git.**

3. Make sure to include the following call to your `main.ts` file:

```typescript
if (process.env.NODE_ENV !== 'production') require('dotenv').config();
```

> This line must be added before any other imports!

### Example

> Note: Check out the CosmosDB example project included in the [sample folder](https://github.com/nestjs/azure-database/tree/master/sample/cosmos-db)

#### Prepare your entity

0. Create a new feature module, eg. with the nest CLI:

```shell
$ nest generate module event
```

1. Create a Data Transfer Object (DTO) inside a file named `event.dto.ts`:

```typescript
export class EventDTO {
  id?: string;
  name: string;
  type: string;
  createdAt: Date;
}
```

2. Create a file called `event.entity.ts` and describe the entity model using the provided decorators:

- `@CosmosPartitionKey(value: string | HierarchicalPartitionKey)`: Represents the `PartitionKey` or [`HierarchicalPartitionKey`](https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/cosmosdb/cosmos#crud-on-container-with-hierarchical-partition-key) of the entity (**required**).

- `@CosmosDateTime(value?: string)`: For DateTime values.

**Important:** Using a Hierarchical Partition Key requires a container that uses hierarchical partition keys, [read more](https://learn.microsoft.com/azure/cosmos-db/hierarchical-partition-keys).

For instance, the shape of the following entity:

```typescript
import { CosmosDateTime, CosmosPartitionKey } from '@nestjs/azure-database';
import { PartitionKeyDefinitionVersion, PartitionKeyKind } from '@azure/cosmos';

@CosmosPartitionKey({
  paths: ['/name', '/type/label'],
  version: PartitionKeyDefinitionVersion.V2,
  kind: PartitionKeyKind.MultiHash,
})
export class Event {
  id?: string;
  name: string;
  type: {
    label: string;
  };
  @CosmosDateTime() createdAt: Date;
}
```

Will be automatically converted to:

```json
{
  "name": "NestJS Meetup",
  "type": {
    "label": "Meetup"
  },
  "createdAt": "2019-11-15T17:05:25.427Z"
}
```

1. Import the `AzureCosmosDbModule` inside your Nest feature module `event.module.ts`:

```typescript
import { AzureCosmosDbModule } from '@nestjs/azure-database';
import { Module } from '@nestjs/common';
import { Event } from './event.entity';

@Module({
  imports: [
    AzureCosmosDbModule.forRoot({
      dbName: process.env.AZURE_COSMOS_DB_NAME,
      endpoint: process.env.AZURE_COSMOS_DB_ENDPOINT,
      key: process.env.AZURE_COSMOS_DB_KEY,
      retryAttempts: 1,
    }),
    AzureCosmosDbModule.forFeature([{ dto: Event }]),
  ],
})
export class EventModule {}
```

#### CRUD operations

0. Create a service that will abstract the CRUD operations:

```shell
$ nest generate service event
```

1. Use the `@InjectModel(Event)` to get an instance of the Azure Cosmos DB [Container](https://docs.microsoft.com/en-us/javascript/api/@azure/cosmos/container) for the entity definition created earlier:

```typescript
import { InjectModel } from '@nestjs/azure-database';
import type { Container } from '@azure/cosmos';
import { Injectable } from '@nestjs/common';
import { Event } from './event.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event)
    private readonly eventContainer: Container,
  ) {}
}
```

`@InjectModel(Event)` will inject an Azure Cosmos DB `Container` instance for the `Event` entity. The `Container` provides a list of public methods for managing the database.

**IMPORTANT: Please note that the `Container` instance is not a NestJS repository. It is the actual instance provided by the official [Azure Cosmos DB SDK](https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/cosmosdb/cosmos/README.md).**

##### CREATE

```typescript
async create(eventDto: EventDTO): Promise<Event> {
  const { resource } = await this.eventContainer.items.create<Event>(
    eventDto,
  );
  return resource;
}
```

##### READ

Fetches all the results of the query.

```typescript
async getEvents(): Promise<Event[]> {
  const querySpec = {
    query: 'SELECT * FROM events',
  };

  const { resources } = await this.eventContainer.items
    .query<Event>(querySpec)
    .fetchAll();
  return resources;
}
```

Fetch a single resource.

```typescript
async getEvent(id: string, partitionKey: string | string[]): Promise<Event> {
  const { resource } = await this.eventContainer
        .item(id, type)
        .read<Event>();
  return resource;
}
```

##### UPDATE

Replaces an item in the database.

```typescript
async updateEvent(
  id: string,
  partitionKey: string | string[],
  eventData: EventDTO,
): Promise<Event> {
  let { resource: item } = await this.eventContainer
    .item(id, type)
    .read<Event>();

  item = {
    ...item,
    ...eventData,
  };

  const { resource: replaced } = await this.eventContainer
    .item(id, type)
    .replace(item);

  return replaced;
}
```

##### DELETE

Deletes an item from the database.

```typescript
async deleteEvent(id: string, partitionKey: string | string[]): Promise<Event> {
  const { resource: deleted } = await this.eventContainer
    .item(id, type)
    .delete<Event>();

  return deleted;
}
```

#### Hierarchical Partition Keys

If using hierarchical partition keys, you need to provide the partition key as an array of strings when calling one of the CRUD methods on the `Container`. For example, when reading a single resource:

```javascript
this.eventContainer
        .item("1234", ['foo', 'bar'])
        .read<Event>();
```

Read more about [Hierarchical Partition Keys](https://learn.microsoft.com/en-us/azure/cosmos-db/hierarchical-partition-keys?tabs=javascript-v4%2Carm-json).

## Advanced Search Capabilities

The NestJS Azure Database integration supports advanced search capabilities for Cosmos DB, including **Vector Search**, **Full-Text Search**, and **Hybrid Search** using the latest Azure Cosmos DB features.

### Prerequisites

To use search features, your Cosmos DB container must be configured with appropriate indexing policies:

- **Vector Search**: Requires vector embedding policies and vector indexes
- **Full-Text Search**: Requires full-text indexing policies
- **Hybrid Search**: Requires both vector and full-text indexing policies

### Search Service Setup

The `CosmosSearchService` is automatically provided when you import the `AzureCosmosDbModule`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/azure-database';
import { Container } from '@azure/cosmos';
import { CosmosSearchService } from '@nestjs/azure-database';

@Injectable()
export class ArticleService {
  constructor(
    @InjectModel(Article)
    private readonly articleContainer: Container,
    private readonly searchService: CosmosSearchService,
  ) {}
}
```

### Entity Configuration with Search Decorators

Use the new search decorators to configure your entities for advanced search:

```typescript
import { 
  CosmosPartitionKey, 
  VectorEmbedding, 
  FullTextSearchable 
} from '@nestjs/azure-database';

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

  @VectorEmbedding({
    dimensions: 1536,
    distanceFunction: 'cosine',
    indexType: 'flat',
  })
  embedding: number[];

  author: string;
  publishedAt: Date;
}
```

### Vector Search

Find documents with similar semantic meaning using vector embeddings:

```typescript
// Find articles similar to a query embedding
const similarArticles = await this.searchService.vectorSearch<Article>(
  this.articleContainer,
  {
    vectorPath: '/embedding',
    vector: [0.1, 0.2, 0.3, /* ... */], // Query embedding
    limit: 10,
    distanceFunction: 'cosine',
    similarityThreshold: 0.8,
  }
);

// Results include similarity scores
console.log(similarArticles[0].similarityScore); // 0.95
console.log(similarArticles[0].document.title);  // "Machine Learning Basics"
```

**Supported distance functions:**
- `cosine` - Cosine similarity (recommended for most use cases)
- `dotproduct` - Dot product similarity
- `euclidean` - Euclidean distance

### Full-Text Search

Perform advanced keyword and text matching with highlighting:

```typescript
// Search articles by text with highlighting
const articles = await this.searchService.fullTextSearch<Article>(
  this.articleContainer,
  {
    searchText: 'machine learning artificial intelligence',
    searchFields: ['title', 'content'],
    searchMode: 'any', // 'any' or 'all'
    fuzzySearch: true,
    highlightFields: ['title', 'content'],
  }
);

// Results include text relevance and highlights
console.log(articles[0].textScore);        // 0.89
console.log(articles[0].matchedTerms);     // ['machine', 'learning']
console.log(articles[0].highlights.title); // ['<em>Machine Learning</em> Tutorial']
```

**Search features:**
- **Fuzzy search**: Handles typos and similar terms
- **Field weighting**: Prioritize matches in certain fields
- **Highlighting**: Mark matched terms in results
- **Search modes**: Match any term (`any`) or all terms (`all`)

### Hybrid Search

Combine semantic similarity and keyword relevance for optimal results:

```typescript
// Hybrid search combining vector and text search
const results = await this.searchService.hybridSearch<Article>(
  this.articleContainer,
  {
    vectorSearch: {
      vectorPath: '/embedding',
      vector: queryEmbedding,
      limit: 20,
      distanceFunction: 'cosine',
    },
    fullTextSearch: {
      searchText: 'machine learning tutorial',
      searchFields: ['title', 'content'],
      searchMode: 'any',
      highlightFields: ['title'],
    },
    vectorWeight: 0.6,    // 60% semantic relevance
    textWeight: 0.4,      // 40% keyword relevance
    rankingFunction: 'rrf', // 'rrf' or 'weighted'
  }
);

// Results combine both similarity and text relevance
console.log(results[0].combinedScore); // 0.92
console.log(results[0].vectorScore);   // 0.88
console.log(results[0].textScore);     // 0.95
console.log(results[0].rankingDetails.fusionScore); // 0.92
```

**Ranking functions:**
- `rrf` - Reciprocal Rank Fusion (recommended)
- `weighted` - Linear weighted combination
- `linear` - Simple linear combination

### Advanced Search Examples

**Find similar articles by category:**

```typescript
async findSimilarByCategory(category: string, embedding?: number[]) {
  if (embedding) {
    // Use hybrid search with category embedding
    return this.searchService.hybridSearch(this.articleContainer, {
      vectorSearch: {
        vectorPath: '/embedding',
        vector: embedding,
        limit: 15,
      },
      fullTextSearch: {
        searchText: category,
        searchFields: ['category', 'title'],
      },
      vectorWeight: 0.3,
      textWeight: 0.7,
    });
  } else {
    // Use text search only
    return this.searchService.fullTextSearch(this.articleContainer, {
      searchText: category,
      searchFields: ['category'],
      searchMode: 'all',
    });
  }
}
```

**Content recommendations based on user history:**

```typescript
async getRecommendations(userReadArticles: string[], userEmbedding: number[]) {
  // Find articles similar to user's reading pattern
  const recommendations = await this.searchService.vectorSearch(
    this.articleContainer,
    {
      vectorPath: '/embedding',
      vector: userEmbedding, // Calculated from reading history
      limit: 10,
      distanceFunction: 'cosine',
    }
  );

  // Filter out already read articles
  return recommendations.filter(
    result => !userReadArticles.includes(result.document.id!)
  );
}
```

**Multi-modal search with different vector types:**

```typescript
async searchWithMultipleVectors(
  titleEmbedding: number[],
  contentEmbedding: number[],
  searchText: string
) {
  // Search by title embedding
  const titleResults = await this.searchService.vectorSearch(
    this.articleContainer,
    {
      vectorPath: '/titleEmbedding',
      vector: titleEmbedding,
      limit: 20,
      distanceFunction: 'dotproduct',
    }
  );

  // Search by content embedding
  const contentResults = await this.searchService.vectorSearch(
    this.articleContainer,
    {
      vectorPath: '/contentEmbedding',
      vector: contentEmbedding,
      limit: 20,
      distanceFunction: 'cosine',
    }
  );

  // Combine with text search for comprehensive results
  const hybridResults = await this.searchService.hybridSearch(
    this.articleContainer,
    {
      vectorSearch: {
        vectorPath: '/embedding',
        vector: contentEmbedding,
        limit: 15,
      },
      fullTextSearch: {
        searchText,
        searchFields: ['title', 'content'],
      },
      vectorWeight: 0.5,
      textWeight: 0.5,
    }
  );

  // Merge and deduplicate results based on your business logic
  return this.mergeSearchResults([titleResults, contentResults, hybridResults]);
}
```

### Performance Tips

1. **Vector Index Configuration**: Use appropriate vector index types:
   - `flat`: Best accuracy, higher latency
   - `quantizedFlat`: Good balance of accuracy and performance
   - `diskANN`: Best performance, slightly lower accuracy

2. **Search Optimization**:
   - Use `maxItemCount` in feed options to limit result batching
   - Set appropriate `vectorSearchBufferSize` for large result sets
   - Consider using `allowUnboundedVectorQueries` for exploratory searches

3. **Hybrid Search Tuning**:
   - Adjust vector/text weights based on your use case
   - Use RRF for better ranking quality
   - Pre-filter candidates using metadata before expensive vector operations

### Error Handling

```typescript
try {
  const results = await this.searchService.vectorSearch(container, options);
  return results;
} catch (error) {
  if (error.message.includes('Vector search failed')) {
    // Handle vector search specific errors
    this.logger.error('Vector search error:', error);
  }
  throw error;
}
```

### For Azure Table Storage support

1. Create or update your existing `.env` file with the following content:

```
AZURE_STORAGE_CONNECTION_STRING=
```

2. **IMPORTANT: Make sure to add your `.env` file to your .gitignore! The `.env` file MUST NOT be versioned on Git.**

3. Make sure to include the following call to your `main.ts` file:

```typescript
if (process.env.NODE_ENV !== 'production') require('dotenv').config();
```

> This line must be added before any other imports!

4. The `AzureTableStorageModule` will automatically read the `AZURE_STORAGE_CONNECTION_STRING` environment variable and use it to connect to your Azure Storage account.

### Example

Check out the Table Storage example project included in the [sample folder](https://github.com/nestjs/azure-database/tree/master/sample/table-storage)

#### Prepare your entity

0. Create a new feature module, eg. with the nest CLI:

```shell
$ nest generate module event
```

1. Create a Data Transfer Object (DTO) inside a file named `event.dto.ts`:

```typescript
export class EventDTO {
  name: string;
  type: string;
}
```

2. Create a file called `event.entity.ts` and describe the entity model using plain JavaScript objects. **The only requirement is to provide a `partitionKey` and a `rowKey` properties.** For instance, the shape of the following entity:

```typescript
export class Event {
  partitionKey: string; // required
  rowKey: string; // required
  name: string;
  type: string;
}
```

1. Import the `AzureTableStorageModule` inside your Nest feature module `event.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AzureTableStorageModule } from '@nestjs/azure-database';

@Module({
  imports: [AzureTableStorageModule.forFeature(Event)],
})
export class EventModule {}
```

You can optionally pass in the following arguments:

```typescript
import { Module } from '@nestjs/common';
import { AzureTableStorageModule } from '@nestjs/azure-database';

@Module({
  imports: [
    AzureTableStorageModule.forFeature(Event, {
      table: 'foobar',
      createTableIfNotExists: true,
    }),
  ],
})
export class EventModule {}
```

- `table: string`: The name of the table. If not provided, the name of the `Event` entity will be used as a table name
- `createTableIfNotExists: boolean`: Whether to automatically create the table if it doesn't exists or not:
  - If `true` the table will be created during the startup of the app.
  - If `false` the table will not be created. **You will have to create the table by yourself before querying it!**

#### CRUD operations

0. Create a service that will abstract the CRUD operations:

```shell
$ nest generate service event
```

1. Use the `@InjectRepository(Event)` to get an instance of the Azure `Repository` for the entity definition created earlier:

```typescript
import { InjectRepository, Repository } from '@nestjs/azure-database';
import { Injectable } from '@nestjs/common';
import { Event } from './event.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}
}
```

The `AzureTableStorageRepository` provides a list of public methods for managing various CRUD operations:

##### CREATE

`create(entity: T): Promise<T | null>`: creates a new entity.

```typescript
  async create(event: Event): Promise<Event> {
    return await this.eventRepository.create(event);
  }
```

##### READ

`find(partitionKey: string, rowKey: string): Promise<T>`: finds one entity using its `partitionKey` and `rowKey`.

```typescript
  async find(partitionKey: string, rowKey: string): Promise<Event> {
    return await this.eventRepository.find(partitionKey, rowKey);
  }
```

`findAll(options: { queryOptions?: TableEntityQueryOptions }): Promise<T[]>`: finds all entities.

```typescript
  async findAll(options: { queryOptions?: TableEntityQueryOptions }): Promise<Event[]> {
    return await this.eventRepository.findAll();
  }
```

##### UPDATE

`update(partitionKey: string, rowKey: string, entity: T): Promise<T>`: Updates an entity using a "merge" strategy.

```typescript
  async update(
    partitionKey: string,
    rowKey: string,
    event: Event,
  ): Promise<Event> {
    return await this.eventRepository.update(partitionKey, rowKey, event);
  }
```

##### DELETE

`delete(partitionKey: string, rowKey: string): Promise<DeleteTableEntityResponse>`: Removes an entity from the table.

```typescript
  async delete(partitionKey: string, rowKey: string): Promise<void> {
    await this.eventRepository.delete(partitionKey, rowKey);
  }
```

## Testing and Development

### Running Tests

This project includes comprehensive test suites for both Cosmos DB and Table Storage features:

```bash
# Run unit tests
npm test

# Run integration tests (requires Cosmos DB/Storage emulator)
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Generate test coverage report
npm run test:cov
```

### Integration Tests

Integration tests validate the search functionality against a real Cosmos DB instance. To run them:

1. **Start Cosmos DB Emulator** or configure connection to live instance
2. **Seed sample data** (if using the search sample):
   ```bash
   cd samples/cosmos-db-search
   npm run seed
   ```
3. **Run integration tests**:
   ```bash
   npm run test:integration
   ```

The integration tests cover:
- Vector search with different distance functions
- Full-text search with highlighting and fuzzy matching
- Hybrid search with various ranking algorithms
- Error handling and edge cases
- Performance benchmarks

### Sample Applications

The `samples/` directory contains complete working examples:

- **`samples/cosmos-db-search/`**: Advanced search features demo with REST API
- **`sample/cosmos-db/`**: Basic Cosmos DB CRUD operations
- **`sample/table-storage/`**: Azure Table Storage operations

Each sample includes its own README with specific setup instructions.

### Development Workflow

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd azure-database
   
   # Windows users: set PowerShell execution policy first
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   
   npm install
   ```

2. **Run tests** to ensure everything works:
   ```bash
   npm test
   ```

3. **Try the search sample**:
   ```bash
   cd samples/cosmos-db-search
   npm install
   npm run seed
   npm run start:dev
   ```

4. **Make changes** and validate with tests:
   ```bash
   npm run test:integration
   npm run test:cov
   ```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Wassim Chegham](https://wassim.dev)
- Website - [https://wassim.dev](https://wassim.dev/)
- Twitter - [@manekinekko](https://twitter.com/manekinekko)

## License

Nest is [MIT licensed](LICENSE).

[edm-types]: http://bit.ly/nest-edm
