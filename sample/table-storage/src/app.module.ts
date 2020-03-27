import { Module } from '@nestjs/common';
import { AzureTableStorageModule } from '@nestjs/azure-database';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
    ContactModule,
    AzureTableStorageModule.forRoot({
      connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    }),
  ],
})
export class AppModule {}
