import { Container } from '@azure/cosmos';
import { InjectModel } from '@nestjs/azure-database';
import { Logger, Injectable } from '@nestjs/common';
import { Contact } from './contact.model';

@Injectable()
export class ContactRepository {
  private logger = new Logger(this.constructor.name);

  constructor(@InjectModel(Contact) private readonly container: Container) {}

  async create(item: Contact): Promise<Contact> {
    item.createdAt = new Date();
    const response = await this.container.items.create(item);
    this.logger.verbose(`Create RUs: ${response.requestCharge}`);
    return response.resource;
  }

  async upsert(item: Contact): Promise<Contact> {
    item.updatedAt = new Date();
    const response = await this.container.items.upsert<Contact>(item);
    this.logger.verbose(`Upsert RUs: ${response.requestCharge}`);
    return response.resource;
  }

  async remove(id: string, partitionKeyValue: any) {
    const item = this.container.item(id, partitionKeyValue);
    const result = await item.delete();
    this.logger.verbose(`Remove item RUs: ${result.requestCharge}`);
  }

  async findAll(): Promise<Contact[]> {
    const querySpec = {
      query: 'SELECT * FROM root r',
    };

    const results = await this.container.items
      .query<Contact>(querySpec, {})
      .fetchAll();
    this.logger.verbose(`Find By Id RUs: ${results.requestCharge}`);
    return results.resources;
  }

  async findById(id: string): Promise<Contact> {
    const querySpec = {
      query: 'SELECT * FROM root r WHERE r.id=@id',
      parameters: [
        {
          name: '@id',
          value: id,
        },
      ],
    };

    const results = await this.container.items
      .query<Contact>(querySpec, {})
      .fetchAll();
    this.logger.verbose(`Find By Id RUs: ${results.requestCharge}`);
    return results.resources.shift();
  }

  async count(): Promise<number> {
    const querySpec = {
      query: 'SELECT VALUE COUNT(1) FROM root r',
    };

    const results = await this.container.items.query(querySpec).fetchAll();
    this.logger.verbose(`Count RUs: ${results.requestCharge}`);
    return results.resources.shift();
  }
}
