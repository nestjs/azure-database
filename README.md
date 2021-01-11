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
<a href="https://travis-ci.org/nestjs/nest"><img src="https://api.travis-ci.org/nestjs/nest.svg?branch=master" alt="Travis" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://img.shields.io/travis/nestjs/nest/master.svg?label=linux" alt="Linux" /></a>
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

Azure Database ([Table Storage](http://bit.ly/nest_azure-storage-table), [Cosmos DB](https://azure.microsoft.com/en-us/services/cosmos-db/) and more) module for [Nest](https://github.com/nestjs/nest) framework (node.js)

## Tutorial

Learn how to get started with [Azure table storage for NestJS](https://trilon.io/blog/nestjs-nosql-azure-table-storage)

## Before Installation

For Table Storage

1. Create a Storage account and resource ([read more](http://bit.ly/nest_new-azure-storage-account))
1. For [Table Storage](http://bit.ly/nest_azure-storage-table), In the [Azure Portal](https://portal.azure.com), go to **Dashboard > Storage > _your-storage-account_**.
1. Note down the "Storage account name" and "Connection string" obtained at **Access keys** under **Settings** tab.

For Cosmos DB

1. Create a Cosmos DB account and resource ([read more](https://azure.microsoft.com/en-us/services/cosmos-db/))
1. For [Cosmos DB](http://bit.ly/nest_azure-storage-table), In the [Azure Portal](https://portal.azure.com), go to **Dashboard > Azure Cosmos DB > _your-cosmos-db-account_**.
1. Note down the "URI" and "Primary Key" obtained at **Keys** under **Settings** tab.

## Installation

```bash
$ npm i --save @nestjs/azure-database
```

## Usage

### For Azure Table Storage support

1. Create or update your existing `.env` file with the following content:

```
AZURE_STORAGE_CONNECTION_STRING=
```

2. **IMPORTANT: Make sure to add your `.env` file to your .gitignore! The `.env` file MUST NOT be versioned on Git.**

3. Make sure to include the following call to your main file:

```typescript
if (process.env.NODE_ENV !== 'production') require('dotenv').config();
```

> This line must be added before any other imports!

### Example

#### Prepare your entity

0. Create a new feature module, eg. with the nest CLI:

```shell
$ nest generate module contact
```

1. Create a Data Transfer Object (DTO) inside a file named `contact.dto.ts`:

```typescript
export class ContactDTO {
  name: string;
  message: string;
}
```

2. Create a file called `contact.entity.ts` and describe the entity model using the provided decorators:

- `@EntityPartitionKey(value: string)`: Represents the `PartitionKey` of the entity (**required**).

- `@EntityRowKey(value: string)`: Represents the `RowKey` of the entity (**required**).

- `@EntityInt32(value?: string)`: For signed 32-bit integer values.

- `@EntityInt64(value?: string)`: For signed 64-bit integer values.

- `@EntityBinary(value?: string)`: For binary (blob) data.

- `@EntityBoolean(value?: string)`: For `true` or `false` values.

- `@EntityString(value?: string)`: For character data.

- `@EntityDouble(value?: string)`: For floating point numbers with 15 digit precision.

- `@EntityDateTime(value?: string)`: For time of day.

For instance, the shape of the following entity:

```typescript
import { EntityPartitionKey, EntityRowKey, EntityString } from '@nestjs/azure-database';

@EntityPartitionKey('ContactID')
@EntityRowKey('ContactName')
export class Contact {
  @EntityString() name: string;
  @EntityString() message: string;
}
```

Will be automatically converted to:

```json
{
  "PartitionKey": { "_": "ContactID", "$": "Edm.String" },
  "RowKey": { "_": "ContactName", "$": "Edm.String" },
  "name": { "_": undefined, "$": "Edm.String" },
  "message": { "_": undefined, "$": "Edm.String" }
}
```

> Note: The provided entity type annotations represent the [Entity Data Model][edm-types] types.

3. Import the `AzureTableStorageModule` inside your Nest feature module `contact.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AzureTableStorageModule } from '@nestjs/azure-database';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { Contact } from './contact.entity';

@Module({
  imports: [AzureTableStorageModule.forFeature(Contact)],
  providers: [ContactService],
  controllers: [ContactController],
})
export class ContactModule {}
```

You can optionally pass in the following arguments:

```typescript
AzureTableStorageModule.forFeature(Contact, {
  table: 'AnotherTableName',
  createTableIfNotExists: true,
});
```

- `table: string`: The name of the table. If not provided, the name of the `Contact` entity will be used as a table name
- `createTableIfNotExists: boolean`: Whether to automatically create the table if it doesn't exists or not:
  - If `true` the table will be created during the startup of the app.
  - If `false` the table will not be created. **You will have to create the table by yourself before querying it!**

#### CRUD operations

0. Create a service that will abstract the CRUD operations:

```shell
$ nest generate service contact
```

1. Use the `@InjectRepository(Contact)` to get an instance of the Azure `Repository` for the entity definition created earlier:

```typescript
import { Injectable } from '@nestjs/common';
import { Repository, InjectRepository } from '@nestjs/azure-database';
import { Contact } from './contact.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}
}
```

The `AzureTableStorageRepository` provides a couple of public APIs and Interfaces for managing various CRUD operations:

##### CREATE

`create(entity: T, rowKeyValue?: string): Promise<T>`: creates a new entity.

```typescript

  @Post()
  async create(contact: Contact, rowKeyValue: string): Promise<Contact> {
    //if rowKeyValue is null, rowKeyValue will generate a UUID
    return this.contactRepository.create(contact, rowKeyValue)
  }
```

##### READ

`find(rowKey: string, entity: Partial<T>): Promise<T>`: finds one entity using its `RowKey`.

```typescript
  @Get(':rowKey')
  async getContact(@Param('rowKey') rowKey) {
    try {
      return await this.contactRepository.find(rowKey, new Contact());
    } catch (error) {
      // Entity not found
      throw new UnprocessableEntityException(error);
    }
  }
```

`findAll(tableQuery?: azure.TableQuery, currentToken?: azure.TableService.TableContinuationToken): Promise<AzureTableStorageResultList<T>>`: finds all entities that match the given query (return all entities if no query provided).

```typescript
  @Get()
  async getAllContacts() {
    return await this.contactRepository.findAll();
  }
```

##### UPDATE

`update(rowKey: string, entity: Partial<T>): Promise<T>`: Updates an entity. It does a partial update.

```typescript
  @Put(':rowKey')
  async saveContact(@Param('rowKey') rowKey, @Body() contactData: ContactDTO) {
    try {
      const contactEntity = new Contact();
      // Disclaimer: Assign only the properties you are expecting!
      Object.assign(contactEntity, contactData);

      return await this.contactRepository.update(rowKey, contactEntity);
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }
  @Patch(':rowKey')
  async updateContactDetails(@Param('rowKey') rowKey, @Body() contactData: Partial<ContactDTO>) {
    try {
      const contactEntity = new Contact();
      // Disclaimer: Assign only the properties you are expecting!
      Object.assign(contactEntity, contactData);

      return await this.contactRepository.update(rowKey, contactEntity);
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }
```

##### DELETE

`delete(rowKey: string, entity: T): Promise<AzureTableStorageResponse>`: Removes an entity from the database.

```typescript

  @Delete(':rowKey')
  async deleteDelete(@Param('rowKey') rowKey) {
    try {
      const response = await this.contactRepository.delete(rowKey, new Contact());

      if (response.statusCode === 204) {
        return null;
      } else {
        throw new UnprocessableEntityException(response);
      }
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }
```

### For Azure Cosmos DB support

1. Create or update your existing `.env` file with the following content:

```
AZURE_COSMOS_DB_NAME=
AZURE_COSMOS_DB_ENDPOINT=
AZURE_COSMOS_DB_KEY=
```

2. **IMPORTANT: Make sure to add your `.env` file to your .gitignore! The `.env` file MUST NOT be versioned on Git.**

3. Make sure to include the following call to your main file:

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
  name: string;
  type: string;
  date: Date;
  location: Point;
}
```

2. Create a file called `event.entity.ts` and describe the entity model using the provided decorators:

- `@CosmosPartitionKey(value: string)`: Represents the `PartitionKey` of the entity (**required**).

- `@CosmosDateTime(value?: string)`: For DateTime values.

For instance, the shape of the following entity:

```typescript
import { CosmosPartitionKey, CosmosDateTime, Point } from '@nestjs/azure-database';

@CosmosPartitionKey('type')
export class Event {
  id?: string;
  type: string;
  @CosmosDateTime() createdAt: Date;
  location: Point;
}
```

Will be automatically converted to:

```json
{
  "type": "Meetup",
  "createdAt": "2019-11-15T17:05:25.427Z",
  "position": {
    "type": "Point",
    "coordinates": [2.3522, 48.8566]
  }
}
```

3. Import the `AzureCosmosDbModule` inside your Nest feature module `event.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AzureCosmosDbModule } from '@nestjs/azure-database';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event } from './event.entity';

@Module({
  imports: [
    AzureCosmosDbModule.forRoot({
      dbName: process.env.AZURE_COSMOS_DB_NAME,
      endpoint: process.env.AZURE_COSMOS_DB_ENDPOINT,
      key: process.env.AZURE_COSMOS_DB_KEY,
    }),
    AzureCosmosDbModule.forFeature([{ dto: Event }]),
  ],
  providers: [EventService],
  controllers: [EventController],
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
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/azure-database';
import { Event } from './event.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event)
    private readonly eventContainer,
  ) {}
}
```

The Azure Cosmos DB `Container` provides a couple of public APIs and Interfaces for managing various CRUD operations:

##### CREATE

`create(entity: T): Promise<T>`: creates a new entity.

```typescript

  @Post()
  async create(event: Event): Promise<Event> {
      return this.eventContainer.items.create(event)
  }

```

##### READ

`query<T>(query: string | SqlQuerySpec, options?: FeedOptions): QueryIterator<T>`: run a SQL Query to find a document.

```typescript
  @Get(':id')
  async getContact(@Param('id') id) {
    try {
       const querySpec = {
           query: "SELECT * FROM root r WHERE r.id=@id",
           parameters: [
             {
               name: "@id",
               value: id
             }
           ]
         };
        const { resources } = await this.eventContainer.items.query<Event>(querySpec).fetchAll()
         return resources
    } catch (error) {
      // Entity not found
      throw new UnprocessableEntityException(error);
    }
  }
```

##### UPDATE

`read<T>(options?: RequestOptions): Promise<ItemResponse<T>>`: Get a document.
`replace<T>(body: T, options?: RequestOptions): Promise<ItemResponse<T>>`: Updates a document.

```typescript
  @Put(':id')
  async saveEvent(@Param('id') id, @Body() eventData: EventDTO) {
    try {
      const { resource: item } = await this.eventContainer.item<Event>(id, 'type').read()

      // Disclaimer: Assign only the properties you are expecting!
      Object.assign(item, eventData);

      const { resource: replaced } = await this.eventContainer
       .item(id, 'type')
       .replace<Event>(item)
      return replaced
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }
```

##### DELETE

`delete<T>(options?: RequestOptions): Promise<ItemResponse<T>>`: Removes an entity from the database.

```typescript

  @Delete(':id')
  async deleteEvent(@Param('id') id) {
    try {
      const { resource: deleted } = await this.eventContainer
       .item(id, 'type')
       .delete<Event>()

      return deleted;
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
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
