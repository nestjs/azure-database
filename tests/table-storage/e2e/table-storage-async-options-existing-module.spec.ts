import { Test, TestingModule } from '@nestjs/testing';
import { AZURE_TABLE_STORAGE_MODULE_OPTIONS } from '../../../lib';
import { TableStorageAsyncExistingModule } from '../modules/table-storage-async-options-existing.module';

describe('Table Storage (async existing class)', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [TableStorageAsyncExistingModule],
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
