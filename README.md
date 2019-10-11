<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications, heavily inspired by <a href="https://angular.io" target="blank">Angular</a>.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://api.travis-ci.org/nestjs/nest.svg?branch=master" alt="Travis" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://img.shields.io/travis/nestjs/nest/master.svg?label=linux" alt="Linux" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#5" alt="Coverage" /></a>
<a href="https://gitter.im/nestjs/nestjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge"><img src="https://badges.gitter.im/nestjs/nestjs.svg" alt="Gitter" /></a>
<a href="https://opencollective.com/nest#backer"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec"><img src="https://img.shields.io/badge/Donate-PayPal-dc3d53.svg"/></a>
  <a href="https://twitter.com/nestframework"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Azure Database ([Table Storage](http://bit.ly/nest_azure-storage-table) and more) module for [Nest](https://github.com/nestjs/nest) framework (node.js)

## Tutorial

Learn how to get started with [Azure table storage for NestJS](https://trilon.io/blog/nestjs-nosql-azure-table-storage)


## Before Installation

1. Create a Storage account and resource ([read more](http://bit.ly/nest_new-azure-storage-account))
1. For [Table Storage](http://bit.ly/nest_azure-storage-table), In the [Azure Portal](https://portal.azure.com), go to **Dashboard > Storage > _your-storage-account_**.
1. Note down the "Storage account name" and "Connection string" obtained at **Access keys** under **Settings** tab.

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

2. **IMPORTANT: Make sure to add your `.env` file to your .gitignore! The `.env` file MUST NOT be versionned on Git.**

3. Make sure to include the following call to your main file:

```
if (process.env.NODE_ENV !== 'production') require('dotenv').config();
```

> This line must be added before any other imports!

### Example

#### Prepare your entity

0. Create a new feature module, eg. with the nest CLI:

```shell
$ nest generate module contact
```

1. Create a Data Transfert Object (DTO) inside a file named `contact.dto.ts`:

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

- `@EntityBoolean(value?: string)`: For `true` or `false`values.

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

You can optionnaly pass in the following arguments:

```typescript
AzureTableStorageModule.forFeature(Contact, {
  table: 'AnotherTableName',
  createTableIfNotExists: true,
})
```

- `table: string`: The name of the table. If not provided, the name of the `Contact` entity will be used as a table name
- `createTableIfNotExists: boolean`: Whether to automatically create the table if it doesn't exists or not: 
  - If `true` the table will be created during the startup of the app.
  - If `false` the table will not be created. **You will have to create the table by yoursel before querying it!**


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
    private readonly contactRepository: Repository<Contact>) {}
}
```

The `AzureTableStorageRepository` provides a couple of public APIs and Interfaces for managing various CRUD operations:

##### CREATE

`create(entity: T): Promise<T>`: creates a new entity.

```typescript
  @Get()
  async getAllContacts() {
    return await this.contactService.findAll();
  }
```

##### READ

`find(rowKey: string, entity: Partial<T>): Promise<T>`: finds one entity using its `RowKey`.

```typescript
  @Get(':rowKey')
  async getContact(@Param('rowKey') rowKey) {
    try {
      return await this.contactService.find(rowKey, new Contact());
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
    return await this.contactService.findAll();
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

      return await this.contactService.update(rowKey, contactEntity);
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

      return await this.contactService.update(rowKey, contactEntity);
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
      const response = await this.contactService.delete(rowKey, new Contact());

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

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Wassim Chegham](https://wassim.dev)
- Website - [https://wassim.dev](https://wassim.dev/)
- Twitter - [@manekinekko](https://twitter.com/manekinekko)

## License

Nest is [MIT licensed](LICENSE).

[edm-types]: http://bit.ly/nest-edm
