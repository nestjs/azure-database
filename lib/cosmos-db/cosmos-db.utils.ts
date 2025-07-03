import { Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { delay, retryWhen, scan } from 'rxjs/operators';
import { DEFAULT_DB_CONNECTION } from './cosmos-db.constants';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function getuserAgentSuffix(): Promise<string> {
  try {
    const data = await readFile(join(__dirname, '..', '..', 'package.json'), 'utf8');
    const json = await JSON.parse(data);
    if (json.name && json.version) {
      return `node.js/${process.version} (${process.platform}; ${process.arch}) ${json.name}/${json.version}`;
    }
    throw new Error('Missing required package.json properties');
  } catch {
    return `node.js/${process.version} (${process.platform}; ${process.arch}) @nestjs/azure-database/0.0.0`;
  }
}

export function getModelToken(model: string) {
  return `${model}AzureCosmosDbModel`;
}

export function getConnectionToken(name?: string) {
  return name && name !== DEFAULT_DB_CONNECTION ? `${name}AzureCosmosDbConnection` : DEFAULT_DB_CONNECTION;
}

export function handleRetry(retryAttempts = 9, retryDelay = 3000): <T>(source: Observable<T>) => Observable<T> {
  return <T>(source: Observable<T>) =>
    source.pipe(
      // TODO: migrate from retryWhen().
      retryWhen(e =>
        e.pipe(
          scan((errorCount, error) => {
            Logger.error(
              `Unable to connect to the cosmos db database. Retrying (${errorCount + 1})...`,
              '',
              'AzureCosmosDbModule',
            );
            if (errorCount + 1 >= retryAttempts) {
              throw error;
            }
            return errorCount + 1;
          }, 0),
          delay(retryDelay),
        ),
      ),
    );
}

/**
 * Pluralize function
 */
const pluralization = [
  [/(m)an$/gi, '$1en'],
  [/(pe)rson$/gi, '$1ople'],
  [/(child)$/gi, '$1ren'],
  [/^(ox)$/gi, '$1en'],
  [/(ax|test)is$/gi, '$1es'],
  [/(octop|vir)us$/gi, '$1i'],
  [/(alias|status)$/gi, '$1es'],
  [/(bu)s$/gi, '$1ses'],
  [/(buffal|tomat|potat)o$/gi, '$1oes'],
  [/([ti])um$/gi, '$1a'],
  [/sis$/gi, 'ses'],
  [/(?:([^f])fe|([lr])f)$/gi, '$1$2ves'],
  [/(hive)$/gi, '$1s'],
  [/([^aeiouy]|qu)y$/gi, '$1ies'],
  [/(x|ch|ss|sh)$/gi, '$1es'],
  [/(matr|vert|ind)ix|ex$/gi, '$1ices'],
  [/([m|l])ouse$/gi, '$1ice'],
  [/(kn|w|l)ife$/gi, '$1ives'],
  [/(quiz)$/gi, '$1zes'],
  [/s$/gi, 's'],
  [/([^a-z])$/, '$1'],
  [/$/gi, 's'],
];
const rules = pluralization;

/**
 * Uncountable words.
 *
 * These words are applied while processing the argument to `toCollectionName`.
 * @api public
 */

const uncountables = [
  'advice',
  'energy',
  'excretion',
  'digestion',
  'cooperation',
  'health',
  'justice',
  'labour',
  'machinery',
  'equipment',
  'information',
  'pollution',
  'sewage',
  'paper',
  'money',
  'species',
  'series',
  'rain',
  'rice',
  'fish',
  'sheep',
  'moose',
  'deer',
  'news',
  'expertise',
  'status',
  'media',
];

/*!
 * Pluralize function.
 *
 * @author TJ Holowaychuk (extracted from _ext.js_)
 * @param {String} string to pluralize
 * @api private
 */

export function pluralize(str: string) {
  let found: any[][];
  str = str.toLowerCase();
  // tslint:disable-next-line: no-bitwise
  if (!~uncountables.indexOf(str)) {
    found = rules.filter(rule => {
      return str.match(rule[0]);
    });
    if (found[0]) {
      return str.replace(found[0][0], found[0][1]);
    }
  }
  return str;
}
