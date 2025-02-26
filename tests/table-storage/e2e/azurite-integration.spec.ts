import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process';
import { Test, TestingModule } from '@nestjs/testing';
import { AzureTableStorageModule } from '../../../lib';
import { AzuriteModule } from '../modules/azurite.module';
import { Event, EventService } from '../services';
import { Logger } from '@nestjs/common';

const logger = new Logger(`AzureStorageRepository`);

/**
 * Integration test to integrate the library to Azurite emulator
 * https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string#configure-a-connection-string-for-azurite
 */
describe('azurite-integration', () => {
  let moduleRef: TestingModule;
  let server: ChildProcessWithoutNullStreams;
  let tableHost: string;
  let service: EventService;

  beforeAll(async () => {
    let started = false;
    server = spawn('npx', ['azurite-table', '--inMemoryPersistence', '--tablePort', '10101']);

    await new Promise((resolve, reject) => {
      server.stdout.on('data', (data: Buffer) => {
        logger.debug(data.toString());

        if (data.toString().includes(`Azurite Table service successfully started on `)) {
          started = true;
          const matches = data.toString().match(/Azurite Table service successfully started on (?<host>[\d.:]+)/);
          if (matches && matches.groups) {
            tableHost = matches.groups['host'];
            resolve(undefined);
          } else {
            reject('Host cannot be determined');
          }
        }
      });

      server.stderr.on('data', (data: Buffer) => {
        logger.error(data.toString());
        if (!started) reject(data.toString());
      });
    });

    logger.log('Server listening');

    const connectionString = `DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;TableEndpoint=http://${tableHost}/devstoreaccount1;`;
    process.env.AZURE_STORAGE_CONNECTION_STRING = connectionString;

    moduleRef = await Test.createTestingModule({
      imports: [
        AzureTableStorageModule.forRoot({
          connectionString,
          allowInsecureConnection: true,
        }),
        AzuriteModule,
      ],
    }).compile();

    service = moduleRef.get(EventService);
  });

  afterAll(() => {
    server.kill();
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
