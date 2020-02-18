import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { ContactRepository } from './contact.repository';

describe('ContactService', () => {
  let service: ContactService;

  const repository: Partial<ContactRepository> = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        {
          provide: ContactRepository,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
