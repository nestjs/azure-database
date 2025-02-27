import { Test, TestingModule } from '@nestjs/testing';
import { AZURE_TABLE_STORAGE_MODULE_OPTIONS } from '../../../lib';
import { TableStorageModule } from '../modules/table-storage-options.module';

describe('Table Storage (sync class)', () => {
  let moduleRef: TestingModule;

  const originalEnv = process.env;
  afterEach(() => {
    process.env = originalEnv;
  });

  beforeEach(async () => {
    process.env.AZURE_STORAGE_CONNECTION_STRING = 'abc';
    moduleRef = await Test.createTestingModule({
      imports: [TableStorageModule],
    }).compile();
  });

  it('should return options provide by useFactory', () => {
    const options = moduleRef.get(AZURE_TABLE_STORAGE_MODULE_OPTIONS);

    expect(options).toEqual({
      accountName: 'account-name',
      allowInsecureConnection: false,
      sasKey: 'sas-key',
      connectionString: 'connection-string',
    });
  });
});
