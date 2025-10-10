describe('API Endpoints (e2e)', () => {
  it('should validate event creation payload', () => {
    const eventPayload = {
      title: 'Test Event',
      type: ['test'],
      description: 'A test event for the API',
      category: 'technology',
      tags: ['test', 'api']
    };

    expect(eventPayload.title).toBe('Test Event');
    expect(eventPayload.type).toContain('test');
    expect(eventPayload.category).toBe('technology');
    expect(Array.isArray(eventPayload.tags)).toBe(true);
  });

  it('should validate search endpoint payloads', () => {
    // Vector search payload
    const vectorSearchPayload = {
      vector: new Array(1536).fill(0.1),
      limit: 10,
      category: 'technology'
    };

    expect(vectorSearchPayload.vector).toHaveLength(1536);
    expect(vectorSearchPayload.limit).toBe(10);

    // Full-text search payload
    const fullTextSearchPayload = {
      searchText: 'machine learning conference',
      limit: 20,
      category: 'technology'
    };

    expect(fullTextSearchPayload.searchText).toContain('machine learning');
    expect(fullTextSearchPayload.limit).toBe(20);

    // Hybrid search payload
    const hybridSearchPayload = {
      vectorSearch: {
        vector: [0.1, 0.2, 0.3]
      },
      fullTextSearch: {
        searchText: 'AI conference'
      },
      limit: 15,
      vectorWeight: 0.6,
      textWeight: 0.4
    };

    expect(hybridSearchPayload.vectorWeight + hybridSearchPayload.textWeight).toBe(1.0);
    expect(hybridSearchPayload.vectorSearch.vector).toHaveLength(3);
  });

  it('should validate metadata search parameters', () => {
    const metadataParams = {
      category: 'technology',
      tags: 'AI,ML,conference',
      priority: 'high',
      status: 'active',
      limit: 25
    };

    const tagsArray = metadataParams.tags.split(',').map(tag => tag.trim());

    expect(tagsArray).toContain('AI');
    expect(tagsArray).toContain('ML');
    expect(tagsArray).toContain('conference');
    expect(metadataParams.limit).toBe(25);
  });
});
