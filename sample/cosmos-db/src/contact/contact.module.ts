import { Module } from '@nestjs/common';
import { AzureCosmosDbModule } from '@nestjs/azure-database';
import { ContactController } from './contact.controller';
import { Contact } from './contact.model';
import { ContactService } from './contact.service';

@Module({
  imports: [AzureCosmosDbModule.forFeature([{ dto: Contact }])],
  providers: [ContactService],
  controllers: [ContactController],
})
export class ContactModule {}
