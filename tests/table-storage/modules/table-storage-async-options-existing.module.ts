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
  providers: [ConfigService],
  exports: [ConfigService],
})
class ConfigModule {}

@Module({
  imports: [
    AzureTableStorageModule.forRootAsync({
      imports: [ConfigModule],
      useExisting: ConfigService,
    }),
  ],
})
export class TableStorageAsyncExistingModule {}
