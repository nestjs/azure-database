import { AzureCosmosDbModule } from '@nestjs/azure-database';
import { Module } from '@nestjs/common';
import { Event } from './event.entity';
import { EventService } from './event.service';
import { EventController } from './event.controller';

@Module({
  imports: [
    AzureCosmosDbModule.forRoot({
      dbName: process.env.AZURE_COSMOS_DB_NAME,
      endpoint: process.env.AZURE_COSMOS_DB_ENDPOINT,
      key: process.env.AZURE_COSMOS_DB_KEY,
      retryAttempts: 1,
    }),
    AzureCosmosDbModule.forFeature([{ dto: Event }]),
  ],
  providers: [EventService],
  controllers: [EventController],
})
export class EventModule {}
