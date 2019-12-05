import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './create-contact.dto';
import { Contact } from './contact.model';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(@Body() createContact: CreateContactDto) {
    this.contactService.create(createContact);
  }

  @Get()
  async findAll(): Promise<Contact[]> {
    return this.contactService.getAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactService.getContact(id);
  }
}
