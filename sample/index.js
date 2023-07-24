if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

(async () => {
  const cosmos = require('@azure/cosmos');
  const endpoint = process.env.AZURE_COSMOS_DB_ENDPOINT;
  const key = process.env.AZURE_COSMOS_DB_KEY;
  const dbDefName = process.env.AZURE_COSMOS_DB_NAME;
  const client = new cosmos.CosmosClient({ endpoint, key });

  const dbResponse = await client.databases.createIfNotExists({
    id: dbDefName,
  });

  const { resource } = await client.database('ToDoList').container('events').item('1689756044201', 'type').read();
  console.log({ resource });
})();
