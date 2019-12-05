import { Injectable, NotFoundException } from '@nestjs/common';
import { Contact } from './contact.model';
import { ContactRepository } from './contact.repository';

@Injectable()
export class ContactService {
  constructor(private readonly contactRepository: ContactRepository) {}

  async create(contact: Contact): Promise<Contact> {
    return this.contactRepository.create(contact);
  }

  async update(contact: Contact): Promise<Contact> {
    return this.contactRepository.upsert(contact);
  }

  async delete(contactId: string) {
    const contact = await this.contactRepository.findById(contactId);
    if (contact) {
      return this.contactRepository.remove(contactId, contact.type);
    }

    throw new NotFoundException('Item with id: ' + contactId + ' not found');
  }

  async getAll(): Promise<Contact[]> {
    return this.contactRepository.findAll();
  }

  async getContact(contactId: string): Promise<Contact> {
    return this.contactRepository.findById(contactId);
  }
}
