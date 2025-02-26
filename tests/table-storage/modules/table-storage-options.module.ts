import { Module } from '@nestjs/common';
import { AzureTableStorageModule } from '../../../lib';

@Module({
  imports: [
    AzureTableStorageModule.forRoot({
      accountName: 'account-name',
      sasKey: 'sas-key',
      connectionString: 'connection-string',
      allowInsecureConnection: false,
    }),
  ],
})
export class TableStorageModule {}
