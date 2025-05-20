// /**
//  * Elasticsearch Helper Functions for Hono
//  * 
//  * This module provides helper functions for interacting with Elasticsearch
//  * within Hono request handlers. It includes functions for CRUD operations
//  * (create, read, update, delete) and indexing.
//  */

// import { Client } from '@elastic/elasticsearch';
// import { Context } from 'hono';

// /**
//  * Configuration interface for Elasticsearch client
//  */
// interface ElasticsearchConfig {
//   node: string;
//   auth?: {
//     username: string;
//     password: string;
//   };
//   tls?: {
//     ca?: string;
//     rejectUnauthorized?: boolean;
//   };
// }

// /**
//  * Creates and returns an Elasticsearch client instance
//  * 
//  * @param config - Configuration for Elasticsearch client
//  * @returns Elasticsearch client instance
//  */
// export const createElasticsearchClient = (config: ElasticsearchConfig): Client => {
//   return new Client(config);
// };

// /**
//  * Index a document in Elasticsearch
//  * 
//  * @param client - Elasticsearch client instance
//  * @param index - Name of the index
//  * @param document - Document to be indexed
//  * @param id - Optional ID for the document (if not provided, Elasticsearch will generate one)
//  * @returns Response from Elasticsearch
//  */
// export const indexDocument = async <T extends Record<string, any>>(
//   client: Client,
//   index: string,
//   document: T,
//   id?: string
// ) => {
//   try {
//     // Pass the document directly as the body
//     // The Elasticsearch client expects the document to be the body itself, not inside a document property
//     const params = id 
//       ? { index, id, body: document, refresh: true }
//       : { index, body: document, refresh: true };
    
//     return await client.index(params);
//   } catch (error) {
//     console.error('Error indexing document:', error);
//     throw error;
//   }
// };

// /**
//  * Bulk index multiple documents in Elasticsearch
//  * 
//  * @param client - Elasticsearch client instance
//  * @param index - Name of the index
//  * @param documents - Array of documents to be indexed
//  * @returns Response from Elasticsearch
//  */
// export const bulkIndexDocuments = async <T>(
//   client: Client,
//   index: string,
//   documents: T[]
// ) => {
//   try {
//     const body = documents.flatMap(doc => [
//       { index: { _index: index } },
//       doc
//     ]);
    
//     return await client.bulk({ refresh: true, body });
//   } catch (error) {
//     console.error('Error bulk indexing documents:', error);
//     throw error;
//   }
// };

// /**
//  * Get a document from Elasticsearch by ID
//  * 
//  * @param client - Elasticsearch client instance
//  * @param index - Name of the index
//  * @param id - ID of the document to retrieve
//  * @returns Document if found
//  */
// export const getDocument = async <T>(
//   client: Client,
//   index: string,
//   id: string
// ): Promise<T | null> => {
//   try {
//     const response = await client.get({ index, id });
//     return response.found ? response._source as T : null;
//   } catch (error) {
//     if ((error as any).statusCode === 404) {
//       return null;
//     }
//     console.error('Error getting document:', error);
//     throw error;
//   }
// };

// /**
//  * Update a document in Elasticsearch
//  * 
//  * @param client - Elasticsearch client instance
//  * @param index - Name of the index
//  * @param id - ID of the document to update
//  * @param document - Document data to update
//  * @param upsert - Whether to insert the document if it doesn't exist
//  * @returns Response from Elasticsearch
//  */
// export const updateDocument = async <T>(
//   client: Client,
//   index: string,
//   id: string,
//   document: Partial<T>,
//   upsert = false
// ) => {
//   try {
//     const params = {
//       index,
//       id,
//       body: {
//         document,
//       },
//       refresh: true
//     };
    
//     return await client.update(params);
//   } catch (error) {
//     console.error('Error updating document:', error);
//     throw error;
//   }
// };

// /**
//  * Delete a document from Elasticsearch
//  * 
//  * @param client - Elasticsearch client instance
//  * @param index - Name of the index
//  * @param id - ID of the document to delete
//  * @returns Response from Elasticsearch
//  */
// export const deleteDocument = async (
//   client: Client,
//   index: string,
//   id: string
// ) => {
//   try {
//     return await client.delete({
//       index,
//       id,
//       refresh: true
//     });
//   } catch (error) {
//     if ((error as any).statusCode === 404) {
//       return { result: 'not_found' };
//     }
//     console.error('Error deleting document:', error);
//     throw error;
//   }
// };

// /**
//  * Search for documents in Elasticsearch
//  * 
//  * @param client - Elasticsearch client instance
//  * @param index - Name of the index
//  * @param query - Elasticsearch query DSL object
//  * @param size - Maximum number of results to return
//  * @param from - Offset for pagination
//  * @returns Search results
//  */
// export const searchDocuments = async <T>(
//   client: Client,
//   index: string,
//   query: any,
//   size = 10,
//   from = 0
// ) => {
//   try {
//     // Use the correct parameter structure:
//     // The size and from parameters should be at the top level, not inside the body
//     const response = await client.search({
//       index,
//       size,
//       from,
//       body: {
//         query
//       }
//     });
    
//     const hits = response.hits.hits;
//     const total = response.hits.total as { value: number };
    
//     return {
//       hits: hits.map(hit => ({
//         ...hit._source as T,
//         _id: hit._id,
//         _score: hit._score
//       })),
//       total: total.value
//     };
//   } catch (error) {
//     console.error('Error searching documents:', error);
//     throw error;
//   }
// };

// /**
//  * Check if an index exists in Elasticsearch
//  * 
//  * @param client - Elasticsearch client instance
//  * @param index - Name of the index to check
//  * @returns Boolean indicating whether the index exists
//  */
// export const indexExists = async (
//   client: Client,
//   index: string
// ): Promise<boolean> => {
//   try {
//     const response = await client.indices.exists({ index });
//     return response.body;
//   } catch (error) {
//     console.error('Error checking if index exists:', error);
//     throw error;
//   }
// };

// /**
//  * Create an index in Elasticsearch
//  * 
//  * @param client - Elasticsearch client instance
//  * @param index - Name of the index to create
//  * @param mappings - Optional index mappings
//  * @param settings - Optional index settings
//  * @returns Response from Elasticsearch
//  */
// export const createIndex = async (
//   client: Client,
//   index: string,
//   mappings?: any,
//   settings?: any
// ) => {
//   try {
//     const body: any = {};
    
//     if (mappings) {
//       body.mappings = mappings;
//     }
    
//     if (settings) {
//       body.settings = settings;
//     }
    
//     return await client.indices.create({
//       index,
//       body
//     });
//   } catch (error) {
//     console.error('Error creating index:', error);
//     throw error;
//   }
// };

// /**
//  * Delete an index from Elasticsearch
//  * 
//  * @param client - Elasticsearch client instance
//  * @param index - Name of the index to delete
//  * @returns Response from Elasticsearch
//  */
// export const deleteIndex = async (
//   client: Client,
//   index: string
// ) => {
//   try {
//     return await client.indices.delete({ index });
//   } catch (error) {
//     console.error('Error deleting index:', error);
//     throw error;
//   }
// };

// /**
//  * Create Hono middleware for attaching an Elasticsearch client to the context
//  * 
//  * @param config - Elasticsearch configuration
//  * @returns Hono middleware function
//  */
// export const elasticsearchMiddleware = (config: ElasticsearchConfig) => {
//   const client = createElasticsearchClient(config);
  
//   return async (c: Context, next: () => Promise<void>) => {
//     // Attach the Elasticsearch client to the context
//     c.set('es', client);
//     await next();
//   };
// };

// /**
//  * Example usage in a Hono route handler:
//  * 
//  * ```typescript
//  * import { Hono } from 'hono';
//  * import { 
//  *   elasticsearchMiddleware, 
//  *   indexDocument, 
//  *   getDocument 
//  * } from './elasticsearch-helpers';
//  * 
//  * const app = new Hono();
//  * 
//  * // Add Elasticsearch middleware
//  * app.use('*', elasticsearchMiddleware({
//  *   node: 'http://localhost:9200'
//  * }));
//  * 
//  * // Create endpoint
//  * app.post('/products', async (c) => {
//  *   const esClient = c.get('es');
//  *   const body = await c.req.json();
//  *   
//  *   const result = await indexDocument(esClient, 'products', body);
//  *   
//  *   return c.json({ 
//  *     message: 'Product created',
//  *     id: result._id 
//  *   }, 201);
//  * });
//  * 
//  * // Get endpoint
//  * app.get('/products/:id', async (c) => {
//  *   const esClient = c.get('es');
//  *   const id = c.req.param('id');
//  *   
//  *   const product = await getDocument(esClient, 'products', id);
//  *   
//  *   if (!product) {
//  *     return c.json({ message: 'Product not found' }, 404);
//  *   }
//  *   
//  *   return c.json(product);
//  * });
//  * ```
//  */