import { Test, TestingModule } from '@nestjs/testing';
import { AZURE_TABLE_STORAGE_MODULE_OPTIONS } from '../../../lib';
import { TableStorageAsyncModule } from '../modules/table-storage-async-options.module';

describe('Table Storage (async class)', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [TableStorageAsyncModule],
    }).compile();
  });

  it('should return options provide by useFactory', () => {
    const options = moduleRef.get(AZURE_TABLE_STORAGE_MODULE_OPTIONS);

    expect(options).toEqual({
      accountName: 'account-name',
      sasKey: 'sas-key',
      connectionString: 'connection-string',
    });
  });
});
