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

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Wassim Chegham](https://wassim.dev)
- Website - [https://wassim.dev](https://wassim.dev/)
- Twitter - [@manekinekko](https://twitter.com/manekinekko)

## License

Nest is [MIT licensed](LICENSE).

[edm-types]: http://bit.ly/nest-edm
