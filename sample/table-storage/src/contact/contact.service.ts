import {
  AzureTableStorageResponse,
  AzureTableStorageResultList,
  InjectRepository,
  Repository,
} from '@nestjs/azure-database';
import { Injectable } from '@nestjs/common';
import { Contact } from './contact.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  // find one contact entity by its rowKey
  async find(rowKey: string, contact: Contact): Promise<Contact> {
    return this.contactRepository.find(rowKey, contact);
  }

  // find all Contact entities
  async findAll(): Promise<AzureTableStorageResultList<Contact>> {
    return this.contactRepository.findAll();
  }

  // create a new Contact entity
  async create(contact: Contact): Promise<Contact> {
    return this.contactRepository.create(contact);
  }

  // update the a Contact entity by its rowKey
  async update(rowKey: string, contact: Partial<Contact>): Promise<Contact> {
    return this.contactRepository.update(rowKey, contact);
  }

  // delete a Contact entity by its rowKey
  async delete(
    rowKey: string,
    contact: Contact,
  ): Promise<AzureTableStorageResponse> {
    return this.contactRepository.delete(rowKey, contact);
  }
}
