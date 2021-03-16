import { Module } from '@nestjs/common';
import { AzureTableStorageModule, AzureTableStorageOptionsFactory } from '../../../lib';

class ConfigService implements AzureTableStorageOptionsFactory {
  createAzureTableStorageOptions() {
    return {
      accountName: 'account-name',
      sasKey: 'sas-key',
      connectionString: 'connection-string',
    };
  }
}

@Module({
  imports: [
    AzureTableStorageModule.forRootAsync({
      useClass: ConfigService,
    }),
  ],
})
export class TableStorageAsyncClassModule {}
