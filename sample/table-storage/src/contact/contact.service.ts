import { AzureTableStorageResponse, AzureTableStorageResultList, InjectRepository, Repository } from '@nestjs/azure-database';
import { Injectable } from '@nestjs/common';
import { TableQuery } from 'azure-storage';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';

@Injectable()
export class ContactService {

  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}
  
  // find one contact entitu by its rowKey
  async find(rowKey: string, contact: Contact): Promise<Contact> {
    return await this.contactRepository.find(rowKey, contact);
  }

  // find all Contact entities
  async findAll(): Promise<AzureTableStorageResultList<Contact>> {
    return await this.contactRepository.findAll();
  }

  async queryAll(): Promise<AzureTableStorageResultList<Contact>> {
    // Read more: https://docs.microsoft.com/en-us/azure/cosmos-db/table/how-to-use-nodejs#query-a-set-of-entities
    const queryExample1 = new TableQuery().where('name eq ?', 'tom');
    return await this.contactRepository.findAll(queryExample1);
  }

  // create a new Contact entity
  async create(contact: Contact): Promise<Contact> {
    return await this.contactRepository.create(contact);
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
    return await this.contactRepository.delete(rowKey, contact);
  }
  
}
