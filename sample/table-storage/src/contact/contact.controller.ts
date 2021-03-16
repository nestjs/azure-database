import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ContactDTO } from './contact.dto';
import { Contact } from './contact.entity';
import { ContactService } from './contact.service';

@Controller()
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  async getAllContacts() {
    return await this.contactService.findAll();
  }

  @Get(':rowKey')
  async getContact(@Param('rowKey') rowKey) {
    try {
      return await this.contactService.find(rowKey, new Contact());
    } catch (error) {
      // Entity not found
      throw new NotFoundException(error);
    }
  }

  @Post()
  async createContact(
    @Body()
    contactData: ContactDTO,
  ) {
    try {
      const contact = new Contact();
      // Disclaimer: Assign only the properties you are expecting!
      Object.assign(contact, contactData);

      return await this.contactService.create(contact);
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  @Put(':rowKey')
  async saveContact(@Param('rowKey') rowKey, @Body() contactData: ContactDTO) {
    try {
      const contact = new Contact();
      // Disclaimer: Assign only the properties you are expecting!
      Object.assign(contact, contactData);

      return await this.contactService.update(rowKey, contact);
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  @Patch(':rowKey')
  async updateContactDetails(
    @Param('rowKey') rowKey,
    @Body() contactData: Partial<ContactDTO>,
  ) {
    try {
      const contact = new Contact();
      // Disclaimer: Assign only the properties you are expecting!
      Object.assign(contact, contactData);

      return await this.contactService.update(rowKey, contact);
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  @Delete(':rowKey')
  async deleteContact(@Param('rowKey') rowKey) {
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
}
