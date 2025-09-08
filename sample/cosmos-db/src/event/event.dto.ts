import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';

export class EventDTO {
  id?: string;
  
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @IsOptional()
  @IsString()
  description?: string;
  
  @IsOptional()
  @IsString()
  location?: string;
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
  
  type: {
    label: string;
  };
  
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  embedding?: number[];
  
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  titleEmbedding?: number[];
  
  @IsOptional()
  @IsString()
  category?: string;
  
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';
  
  @IsOptional()
  @IsEnum(['draft', 'published', 'archived'])
  status?: 'draft' | 'published' | 'archived';
  
  createdAt: Date;
  updatedAt?: Date;
}

// Search DTOs for the new search features
export class VectorSearchDTO {
  @IsArray()
  @IsNumber({}, { each: true })
  vector!: number[];
  
  @IsOptional()
  @IsString()
  vectorPath?: string;
  
  @IsOptional()
  @IsEnum(['cosine', 'dotproduct', 'euclidean'])
  distanceFunction?: 'cosine' | 'dotproduct' | 'euclidean';
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  threshold?: number;
  
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class FullTextSearchDTO {
  @IsString()
  @IsNotEmpty()
  searchText!: string;
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  searchFields?: string[];
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlightFields?: string[];
  
  @IsOptional()
  @IsEnum(['any', 'all'])
  searchMode?: 'any' | 'all';
  
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class HybridSearchDTO {
  vectorSearch!: VectorSearchDTO;
  fullTextSearch!: FullTextSearchDTO;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  vectorWeight?: number;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  textWeight?: number;
  
  @IsOptional()
  @IsEnum(['rrf', 'weighted'])
  rankingFunction?: 'rrf' | 'weighted';
  
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
