import { Injectable, Inject } from '@nestjs/common';
import { AzureTableStorageService } from './azure-table.service';
import { AZURE_TABLE_STORAGE_NAME } from './azure-table.constant';

@Injectable()
export class AzureTableStorageRepository<Entity> {
  constructor(
    private readonly manager: AzureTableStorageService,
    @Inject(AZURE_TABLE_STORAGE_NAME) private readonly tableName,
  ) {}
  async findAll() {
    return await this.manager.queryEntities<Entity>(this.tableName, null, null);
  }
  async find() {
    const query = this.manager.queryInstance;
    return await this.manager.queryEntities<Entity>(
      this.tableName,
      query,
      null,
    );
  }

  async create(entity: Entity) {
    return await this.manager.insertEntity<Entity>(this.tableName, entity);
  }
  async save(key: number, entity: Entity) {
    return entity;
  }

  async update(key: number, entity: Partial<Entity>): Promise<Entity> {
    return {} as Entity;
  }

  async delete(key: number) {
    return {} as Entity;
  }
}
