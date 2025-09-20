import { CosmosDateTime, CosmosPartitionKey } from '@nestjs/azure-database';
import { PartitionKeyDefinitionVersion, PartitionKeyKind } from '@azure/cosmos';

@CosmosPartitionKey({
  paths: ['/name', '/type/label'],
  version: PartitionKeyDefinitionVersion.V2,
  kind: PartitionKeyKind.MultiHash
})
export class Event {
  id?: string;
  name: string;
  description?: string;
  location?: string;
  tags?: string[];
  type: {
    label: string;
  };
  
  // Vector search support - embeddings for semantic search
  embedding?: number[]; // Content embedding for vector search
  titleEmbedding?: number[]; // Title embedding for focused search
  
  // Metadata for search and filtering
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'draft' | 'published' | 'archived';
  
  @CosmosDateTime() createdAt: Date;
  @CosmosDateTime() updatedAt?: Date;
}
