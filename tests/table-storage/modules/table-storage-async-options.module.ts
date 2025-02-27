import { Module } from '@nestjs/common';
import { AzureTableStorageModule } from '../../../lib';

@Module({
  imports: [
    AzureTableStorageModule.forRootAsync({
      useFactory: async () => ({
        accountName: 'account-name',
        sasKey: 'sas-key',
        connectionString: 'connection-string',
        allowInsecureConnection: true,
      }),
    }),
  ],
})
export class TableStorageAsyncModule {}
