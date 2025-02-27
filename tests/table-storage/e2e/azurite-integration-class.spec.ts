import { Test, TestingModule } from '@nestjs/testing';
import { AzureTableStorageModule, AzureTableStorageOptionsFactory } from '../../../lib';
import { AzuriteModule } from '../modules/azurite.module';
import { AzuriteTable, Event, EventService } from '../services';

let connectionString: string;

class ConfigService implements AzureTableStorageOptionsFactory {
  createAzureTableStorageOptions() {
    return {
      accountName: 'account-name',
      sasKey: 'sas-key',
      connectionString,
      allowInsecureConnection: true,
    };
  }
}

/**
 * Integration test to integrate the @nestjs/azure-database library to the Azurite emulator
 * https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string#configure-a-connection-string-for-azurite
 */
describe('azurite-integration-class', () => {
  let moduleRef: TestingModule;
  let server: AzuriteTable;
  let service: EventService;

  beforeAll(async () => {
    server = new AzuriteTable(10103);
    await server.start();

    connectionString = server.getConnectionString();

    moduleRef = await Test.createTestingModule({
      imports: [
        AzureTableStorageModule.forRootAsync({
          useClass: ConfigService,
        }),
        AzuriteModule,
      ],
    }).compile();

    service = moduleRef.get(EventService);
  });

  afterAll(async () => {
    await moduleRef.close();
    server.stop();
  });

  it('should be defined', () => {
    expect(moduleRef).toBeDefined();
    expect(server).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('azurite', () => {
    const partitionKey = 'partition-1';
    const rowKey = '1';

    it('should write data', async () => {
      const event: Event = {
        name: 'Event name',
        partitionKey,
        rowKey,
      };

      const result = await service.create(event);
      expect(result).toBeDefined();
    });

    it('should read data', async () => {
      const result = await service.find(partitionKey, rowKey);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('name', 'Event name');
    });

    it('should read all data', async () => {
      const result = await service.findAll();
      expect(result).toBeDefined();
      expect(result).toMatchObject([{ name: 'Event name' }]);
    });
  });
});
