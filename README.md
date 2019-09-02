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

## Before Installation

1. Create a Storage account and resource ([read more](http://bit.ly/nest_new-azure-storage-account))
1. For [Table Storage](http://bit.ly/nest_azure-storage-table), In the [Azure Portal](https://portal.azure.com), go to **Dashboard > Storage > _your-storage-account_**.
1. Note down the "AccountName", "AccountKey" obtained at **Access keys** and "AccountSAS" from **Shared access signature** under **Settings** tab.

## Installation

```bash
$ npm i --save @nestjs/azure-database
```

## Usage

### For Azure Table Storage support

1. Create or update your existing `.env` file with the following content:

```
AZURE_STORAGE_ACCESS_KEY=
AZURE_STORAGE_ACCOUNT=
```

If you want to use a Connection String, use this instead:

```
AZURE_STORAGE_CONNECTION_STRING=
```

2. **IMPORTANT: Make sure to add your `.env` file to your .gitignore! The `.env` file MUST NOT be versionned on Git.**

3. Make sure to include the following call to your main file:

```
if (process.env.NODE_ENV !== 'production') require('dotenv').config();
```

> This line must be added before any other imports!

4. Import `AzureTableStorageModule` in your Nest application.

```typescript
import { Module } from '@nestjs/common';
import { AzureTableStorageModule } from '@nestjs/azure-database';

@Module({
  imports: [
    AzureTableStorageModule.withConfig({
      storageAccount: process.env['AZURE_STORAGE_ACCOUNT'],
      storageAccessKey: process.env['AZURE_STORAGE_ACCESS_KEY'],
      // or if you are using a connection string
      connectionString: process.env['AZURE_STORAGE_CONNECTION_STRING'],
    }),
  ],
})
export class ApplicationModule {}
```

2. 
### Example

TODO

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

* Author - [Wassim Chegham](https://wassim.dev)
* Website - [https://wassim.dev](https://wassim.dev/)
* Twitter - [@manekinekko](https://twitter.com/manekinekko)

## License

Nest is [MIT licensed](LICENSE).
