import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { AzureTableStorageModule } from '@nestjs/azure-database';
import { Contact } from './entities/contact.entity';

@Module({
  imports: [
    AzureTableStorageModule.forFeature(Contact),
  ],
  controllers: [ContactController],
  providers: [ContactService]
})
export class ContactModule {}
