import { Module } from '@nestjs/common';
import { AzureTableStorageModule } from '../../../lib';
import { EventService } from '../services';

@Module({
  imports: [
    AzureTableStorageModule.forFeature(Event, {
      table: 'events',
      createTableIfNotExists: true,
    }),
  ],
  providers: [EventService],
  exports: [EventService],
})
export class AzuriteModule {}
