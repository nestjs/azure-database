import { Module } from '@nestjs/common';
import { AzureTableStorageModule } from '@nestjs/azure-database';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { Contact } from './contact.entity';

@Module({
  imports: [AzureTableStorageModule.forFeature(Contact, {
    table: 'newtable',
    createTableIfNotExists: true })],
  providers: [ContactService],
  controllers: [ContactController],
})
export class ContactModule {}
