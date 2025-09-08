import { InjectModel } from '@nestjs/azure-database';
import type { Container } from '@azure/cosmos';
import { Injectable, UnprocessableEntityException, Logger } from '@nestjs/common';
import { EventDTO, VectorSearchDTO, FullTextSearchDTO, HybridSearchDTO } from './event.dto';
import { Event } from './event.entity';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    @InjectModel(Event)
    private readonly eventContainer: Container,
  ) {}

  async create(eventDto: EventDTO): Promise<Event> {
    if (!eventDto.id) {
      eventDto.id = Date.now().toString();
    }
    const { resource } = await this.eventContainer.items.create<Event>(
      eventDto,
    );
    return resource;
  }

  async getEvents(): Promise<Event[]> {
    try {
      const querySpec = {
        query: 'SELECT * FROM events',
      };
      const { resources } = await this.eventContainer.items
        .query<Event>(querySpec)
        .fetchAll();
      return resources;
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  async getEvent(id: string, type: string | string[]): Promise<Event> {
    try {
      const { resource } = await this.eventContainer
        .item(id, type)
        .read<Event>();

      return resource;
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  async updateEvent(
    id: string,
    type: string | string[],
    eventData: EventDTO,
  ): Promise<Event> {
    try {
      let { resource: item } = await this.eventContainer
        .item(id, type)
        .read<Event>();

      item = {
        ...item,
        ...eventData,
      };

      const { resource: replaced } = await this.eventContainer
        .item(id, type)
        .replace(item);

      return replaced;
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  async deleteEvent(id: string, type: string | string[]): Promise<Event> {
    try {
      const { resource: deleted } = await this.eventContainer
        .item(id, type)
        .delete<Event>();

      return deleted;
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  // New Search Features using Azure Cosmos DB 4.5.1+

  /**
   * Vector Search - Find events similar to the provided vector
   */
  async vectorSearch(searchDto: VectorSearchDTO): Promise<any[]> {
    try {
      this.logger.log(`Performing vector search with ${searchDto.vector.length} dimensions`);
      
      const vectorPath = searchDto.vectorPath || '/embedding';
      const distanceFunction = searchDto.distanceFunction || 'cosine';
      const limit = searchDto.limit || 20;

      const query = `
        SELECT TOP ${limit} e.id, e.name, e.description, e.tags, e.category,
               VectorDistance(e${vectorPath}, @vector, false) AS distance,
               (1 - VectorDistance(e${vectorPath}, @vector, false)) AS similarity
        FROM events e
        WHERE e.embedding != null
        ORDER BY VectorDistance(e${vectorPath}, @vector, false)
      `;

      const { resources } = await this.eventContainer.items
        .query({
          query,
          parameters: [
            {
              name: '@vector',
              value: searchDto.vector,
            },
          ],
        })
        .fetchAll();

      return resources;
    } catch (error) {
      this.logger.error(`Vector search failed: ${error.message}`);
      throw new UnprocessableEntityException(`Vector search failed: ${error.message}`);
    }
  }

  /**
   * Full-Text Search - Search events using text-based search
   */
  async fullTextSearch(searchDto: FullTextSearchDTO): Promise<any[]> {
    try {
      this.logger.log(`Performing full-text search for: "${searchDto.searchText}"`);
      
      const searchFields = searchDto.searchFields || ['name', 'description', 'location'];
      const highlightFields = searchDto.highlightFields || ['name', 'description'];
      const searchMode = searchDto.searchMode || 'any';
      const limit = searchDto.limit || 20;

      // Build the full-text search condition
      const searchConditions = searchFields.map(field => 
        `FullTextContains(e.${field}, @searchText, false)`
      ).join(searchMode === 'all' ? ' AND ' : ' OR ');

      const query = `
        SELECT TOP ${limit} e.id, e.name, e.description, e.tags, e.category, e.location,
               FullTextScore(e.name, @searchText) AS nameScore,
               FullTextScore(e.description, @searchText) AS descriptionScore,
               (FullTextScore(e.name, @searchText) + FullTextScore(e.description, @searchText)) AS totalScore
        FROM events e
        WHERE ${searchConditions}
        ORDER BY (FullTextScore(e.name, @searchText) + FullTextScore(e.description, @searchText)) DESC
      `;

      const { resources } = await this.eventContainer.items
        .query({
          query,
          parameters: [
            {
              name: '@searchText',
              value: searchDto.searchText,
            },
          ],
        })
        .fetchAll();

      return resources;
    } catch (error) {
      this.logger.error(`Full-text search failed: ${error.message}`);
      throw new UnprocessableEntityException(`Full-text search failed: ${error.message}`);
    }
  }

  /**
   * Hybrid Search - Combine vector and full-text search with RRF ranking
   */
  async hybridSearch(searchDto: HybridSearchDTO): Promise<any[]> {
    try {
      this.logger.log('Performing hybrid search (vector + full-text)');
      
      const vectorPath = searchDto.vectorSearch.vectorPath || '/embedding';
      const vectorWeight = searchDto.vectorWeight || 0.5;
      const textWeight = searchDto.textWeight || 0.5;
      const rankingFunction = searchDto.rankingFunction || 'rrf';
      const limit = searchDto.limit || 20;

      const searchFields = searchDto.fullTextSearch.searchFields || ['name', 'description'];
      const searchConditions = searchFields.map(field => 
        `FullTextContains(e.${field}, @searchText, false)`
      ).join(' OR ');

      let query: string;

      if (rankingFunction === 'rrf') {
        // Use RRF (Reciprocal Rank Fusion) for ranking
        query = `
          SELECT TOP ${limit} e.id, e.name, e.description, e.tags, e.category,
                 VectorDistance(e${vectorPath}, @vector, false) AS vectorDistance,
                 (1 - VectorDistance(e${vectorPath}, @vector, false)) AS vectorSimilarity,
                 FullTextScore(e.name, @searchText) + FullTextScore(e.description, @searchText) AS textScore,
                 RRF(VectorDistance(e${vectorPath}, @vector, false), FullTextScore(e.name, @searchText) + FullTextScore(e.description, @searchText)) AS hybridScore
          FROM events e
          WHERE e.embedding != null AND (${searchConditions})
          ORDER BY RANK RRF(VectorDistance(e${vectorPath}, @vector, false), FullTextScore(e.name, @searchText) + FullTextScore(e.description, @searchText))
        `;
      } else {
        // Use weighted ranking
        query = `
          SELECT TOP ${limit} e.id, e.name, e.description, e.tags, e.category,
                 VectorDistance(e${vectorPath}, @vector, false) AS vectorDistance,
                 (1 - VectorDistance(e${vectorPath}, @vector, false)) AS vectorSimilarity,
                 FullTextScore(e.name, @searchText) + FullTextScore(e.description, @searchText) AS textScore,
                 (${vectorWeight} * (1 - VectorDistance(e${vectorPath}, @vector, false)) + ${textWeight} * (FullTextScore(e.name, @searchText) + FullTextScore(e.description, @searchText))) AS hybridScore
          FROM events e
          WHERE e.embedding != null AND (${searchConditions})
          ORDER BY (${vectorWeight} * (1 - VectorDistance(e${vectorPath}, @vector, false)) + ${textWeight} * (FullTextScore(e.name, @searchText) + FullTextScore(e.description, @searchText))) DESC
        `;
      }

      const { resources } = await this.eventContainer.items
        .query({
          query,
          parameters: [
            {
              name: '@vector',
              value: searchDto.vectorSearch.vector,
            },
            {
              name: '@searchText',
              value: searchDto.fullTextSearch.searchText,
            },
          ],
        })
        .fetchAll();

      return resources;
    } catch (error) {
      this.logger.error(`Hybrid search failed: ${error.message}`);
      throw new UnprocessableEntityException(`Hybrid search failed: ${error.message}`);
    }
  }

  /**
   * Search by metadata - category, tags, etc.
   */
  async searchByMetadata(category?: string, tags?: string[], priority?: string, status?: string, limit: number = 20): Promise<Event[]> {
    try {
      let whereConditions: string[] = [];
      let parameters: any[] = [];

      if (category) {
        whereConditions.push('e.category = @category');
        parameters.push({ name: '@category', value: category });
      }

      if (tags && tags.length > 0) {
        const tagConditions = tags.map((_, index) => `ARRAY_CONTAINS(e.tags, @tag${index})`);
        whereConditions.push(`(${tagConditions.join(' OR ')})`);
        tags.forEach((tag, index) => {
          parameters.push({ name: `@tag${index}`, value: tag });
        });
      }

      if (priority) {
        whereConditions.push('e.priority = @priority');
        parameters.push({ name: '@priority', value: priority });
      }

      if (status) {
        whereConditions.push('e.status = @status');
        parameters.push({ name: '@status', value: status });
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      const query = `
        SELECT TOP ${limit} * FROM events e
        ${whereClause}
        ORDER BY e.createdAt DESC
      `;

      const { resources } = await this.eventContainer.items
        .query({ query, parameters })
        .fetchAll();

      return resources;
    } catch (error) {
      this.logger.error(`Metadata search failed: ${error.message}`);
      throw new UnprocessableEntityException(`Metadata search failed: ${error.message}`);
    }
  }
}
