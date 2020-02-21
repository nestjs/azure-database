import { Container, SqlQuerySpec } from '@azure/cosmos';
import { Injectable } from '@nestjs/common';
import { AzureCosmosRepository } from './cosmos-db.interface';

@Injectable()
export class CosmosDbRepository<T> implements AzureCosmosRepository<T> {
  // tslint:disable-next-line: no-empty
  constructor(private readonly container: Container) {}

  /**
   * Creates a new item in the Cosmos DB container.
   *
   * @param item
   */
  async create(item: T): Promise<T> {
    const { resource } = await this.container.items.create<T>(item);
    return resource;
  }

  /**
   * Upserts an item in the Cosmos DB container.
   *
   * @param item
   */
  async upsert(item: T): Promise<T> {
    const { resource } = await this.container.items.upsert<T>(item);
    return resource;
  }

  /**
   * Removes an item from the Cosmos DB container.
   *
   * @param id
   * @param partitionKeyValue
   */
  async remove(id: string, partitionKeyValue: any): Promise<void> {
    const item = this.container.item(id, partitionKeyValue);
    await item.delete();
  }

  /**
   * Returns all items from the Cosmos DB container.
   */
  async findAll(): Promise<T[]> {
    const { resources } = await this.container.items.readAll<T>().fetchAll();

    return resources;
  }

  /**
   * Finds and returns an item in the Cosmos DB container by its Id.
   *
   * @param id
   */
  async findById(id: string, partitionKeyValue: any): Promise<T> {
    const { resource } = await this.container.item(id, partitionKeyValue).read<T>();
    return resource;
  }

  /**
   * Queries
   *
   * @param querySpec
   */
  async query(querySpec: SqlQuerySpec) {
    const { resources } = await this.container.items.query(querySpec).fetchAll();
    return resources;
  }
}
