export class EventDTO {
  id?: string;
  name: string;
  type: {
    label: string;
  }
  createdAt: Date;
}
