# Azure Cosmos DB NestJS Sample with Vector, Full-Text & Hybrid Search

This sample demonstrates a NestJS application integrated with Azure Cosmos DB, showcasing modern search capabilities including vector search, full-text search, and hybrid search using Azure Cosmos DB SDK 4.5.1+.

## Features

### Core Features
- **Event Management**: CRUD operations for events with hierarchical partition keys
- **NestJS Integration**: Complete integration with Azure Cosmos DB using dependency injection

### Advanced Search Capabilities (Azure Cosmos DB 4.5.1+)
- **Vector Search**: Semantic similarity search using embeddings
- **Full-Text Search**: Traditional text search with relevance scoring
- **Hybrid Search**: Combined vector and full-text search with Reciprocal Rank Fusion (RRF)
- **Metadata Search**: Filter events by category, tags, priority, and status

## Prerequisites

- Node.js 18+
- Azure Cosmos DB account with SQL API
- Azure Cosmos DB SDK 4.5.1+ for search features

## Installation

```bash
$ npm install
```

## Configuration

1. Copy `env.sample` to `.env` and configure your Azure Cosmos DB connection:
```bash
COSMOS_DB_CONNECTION_STRING=your_connection_string
COSMOS_DB_DATABASE_NAME=your_database_name
COSMOS_DB_CONTAINER_NAME=your_container_name
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Endpoints

### Basic Event Operations
- `GET /event` - Get all events
- `GET /event/:type/:id` - Get specific event
- `POST /event` - Create new event
- `PUT /event/:type/:id` - Update event
- `DELETE /event/:type/:id` - Delete event

### Search Operations (New in 4.5.1+)

#### Vector Search
```bash
POST /event/search/vector
Content-Type: application/json

{
  "embedding": [0.1, 0.2, 0.3, ...], // 1536-dimensional vector
  "limit": 10,
  "category": "conference" // optional filter
}
```

#### Full-Text Search
```bash
POST /event/search/text
Content-Type: application/json

{
  "searchText": "machine learning conference",
  "limit": 10,
  "category": "technology" // optional filter
}
```

#### Hybrid Search (Vector + Full-Text)
```bash
POST /event/search/hybrid
Content-Type: application/json

{
  "embedding": [0.1, 0.2, 0.3, ...],
  "searchText": "AI conference",
  "limit": 10,
  "vectorWeight": 0.6,
  "textWeight": 0.4
}
```

#### Metadata Search
```bash
GET /event/search/metadata?category=technology&tags=AI,ML&priority=high&status=active&limit=20
```

## Event Data Model

Events support rich metadata for advanced search capabilities:

```typescript
{
  "id": "event-123",
  "type": ["conference", "technology"],
  "title": "AI Conference 2024",
  "description": "Leading conference on artificial intelligence",
  "location": "San Francisco, CA",
  "date": "2024-03-15T09:00:00Z",
  "category": "technology",
  "tags": ["AI", "machine-learning", "conference"],
  "priority": "high",
  "status": "active",
  "embedding": [0.1, 0.2, 0.3, ...], // Vector for semantic search
  "titleEmbedding": [0.1, 0.2, 0.3, ...] // Title-specific vector
}
```

## Search Implementation Details

### Vector Search
- Uses `VectorDistance()` function with cosine similarity
- Supports filtering by category and other metadata
- Embedding dimension: 1536 (OpenAI text-embedding-ada-002 compatible)

### Full-Text Search
- Uses `FullTextContains()` for matching and `FullTextScore()` for relevance
- Searches across title and description fields
- Supports additional metadata filtering

### Hybrid Search
- Combines vector and full-text search using `RRF()` (Reciprocal Rank Fusion)
- Weighted scoring with configurable vector/text weights
- `ORDER BY RANK` for optimal result ranking

## Testing

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Azure Cosmos DB Setup

1. Enable vector indexing in your container settings
2. Configure full-text search policies for optimal performance
3. Ensure proper partition key strategy for your event types

## Dependencies

Key dependencies for search functionality:
- `@azure/cosmos`: ^4.5.1 (required for search features)
- `class-validator`: For DTO validation
- `class-transformer`: For data transformation
- `@nestjs/common`: NestJS core functionality

## License

This sample is [MIT licensed](LICENSE).
