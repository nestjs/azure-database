import { AzureTableStorageModule } from '@nestjs/azure-database';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ContactModule,
    AzureTableStorageModule.forRoot({
      connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    }),
  ],
})
export class AppModule {}
