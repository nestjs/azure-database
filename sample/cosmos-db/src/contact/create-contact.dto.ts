import { Point } from '@nestjs/azure-database';

export class CreateContactDto {
  firstName: string;

  lastNale: string;

  location: Point;

  type: string;

  phoneNumber: string;
}
