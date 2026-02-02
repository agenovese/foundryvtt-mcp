import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { ErrorHandler } from '../utils/error-handler.js';

export interface DocumentManagementToolsOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class DocumentManagementTools {
  private foundryClient: FoundryClient;
  private logger: Logger;
  private errorHandler: ErrorHandler;

  constructor({ foundryClient, logger }: DocumentManagementToolsOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'DocumentManagementTools' });
    this.errorHandler = new ErrorHandler(this.logger);
  }

  getToolDefinitions() {
    return [
      {
        name: 'create-document',
        description: 'Create a Foundry VTT document (Actor or Item) from raw JSON data. Use get-compendium-entry-full to inspect an existing document\'s schema, then construct your own data object matching that schema. The data object must include at least "name" and "type" fields. Supports any actor/item type the game system defines.',
        inputSchema: {
          type: 'object',
          properties: {
            documentType: {
              type: 'string',
              enum: ['Actor', 'Item'],
              description: 'The Foundry document type to create',
            },
            data: {
              type: 'object',
              description: 'Raw JSON document data. Must include "name" (string) and "type" (string) at minimum. Use the same schema structure as returned by get-compendium-entry-full. For actors, include "system", "items", "effects", "prototypeToken" as needed. For items, include "system" with the appropriate fields for the item type.',
            },
            folderName: {
              type: 'string',
              description: 'Optional folder name to organize the created document. A folder will be created if it doesn\'t exist.',
            },
          },
          required: ['documentType', 'data'],
        },
      },
      {
        name: 'update-document',
        description: 'Update an existing Foundry VTT document (Actor or Item). Supports partial updates via dot-notation keys (e.g., "system.hp.value": 50), adding embedded items to actors, and removing embedded items from actors. At least one of updates, addItems, or removeItemIds must be provided.',
        inputSchema: {
          type: 'object',
          properties: {
            documentType: {
              type: 'string',
              enum: ['Actor', 'Item'],
              description: 'The Foundry document type to update',
            },
            documentId: {
              type: 'string',
              description: 'ID of the document to update',
            },
            updates: {
              type: 'object',
              description: 'Partial JSON to merge into the document. Supports dot-notation keys like "system.hp.value": 50. Do not include "_id".',
            },
            addItems: {
              type: 'array',
              items: { type: 'object' },
              description: 'Array of item JSON objects to add as embedded documents (Actor only). Each must have "name" and "type".',
            },
            removeItemIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of embedded item IDs to remove from the actor (Actor only).',
            },
          },
          required: ['documentType', 'documentId'],
        },
      },
    ];
  }

  async handleCreateDocument(args: any): Promise<any> {
    const schema = z.object({
      documentType: z.enum(['Actor', 'Item']),
      data: z.object({
        name: z.string().min(1, 'Document name is required'),
        type: z.string().min(1, 'Document type is required'),
      }).passthrough(),
      folderName: z.string().optional(),
    });

    const { documentType, data, folderName } = schema.parse(args);

    this.logger.info('Creating document', {
      documentType,
      name: data.name,
      type: data.type,
      folderName,
    });

    try {
      const result = await this.foundryClient.query('foundry-mcp-bridge.createDocument', {
        documentType,
        data,
        folderName,
      });

      this.logger.info('Document created', {
        documentType,
        id: result.id,
        name: result.name,
      });

      return {
        success: true,
        documentType,
        id: result.id,
        name: result.name,
        message: `Created ${documentType} "${result.name}" (ID: ${result.id})`,
      };
    } catch (error) {
      this.errorHandler.handleToolError(error, 'create-document', 'document creation');
    }
  }

  async handleUpdateDocument(args: any): Promise<any> {
    const schema = z.object({
      documentType: z.enum(['Actor', 'Item']),
      documentId: z.string().min(1, 'Document ID is required'),
      updates: z.record(z.any()).optional(),
      addItems: z.array(z.object({
        name: z.string().min(1),
        type: z.string().min(1),
      }).passthrough()).optional(),
      removeItemIds: z.array(z.string().min(1)).optional(),
    }).refine(
      (data) => data.updates || data.addItems || data.removeItemIds,
      { message: 'At least one of updates, addItems, or removeItemIds must be provided' }
    );

    const { documentType, documentId, updates, addItems, removeItemIds } = schema.parse(args);

    this.logger.info('Updating document', {
      documentType,
      documentId,
      hasUpdates: !!updates,
      addItemsCount: addItems?.length || 0,
      removeItemIdsCount: removeItemIds?.length || 0,
    });

    try {
      const result = await this.foundryClient.query('foundry-mcp-bridge.updateDocument', {
        documentType,
        documentId,
        updates,
        addItems,
        removeItemIds,
      });

      this.logger.info('Document updated', {
        documentType,
        documentId,
        name: result.name,
      });

      const parts: string[] = [`Updated ${documentType} "${result.name}" (ID: ${documentId})`];
      if (result.updatedFields) {
        parts.push(`Fields updated: ${result.updatedFields}`);
      }
      if (result.itemsAdded) {
        parts.push(`Items added: ${result.itemsAdded}`);
      }
      if (result.itemsRemoved) {
        parts.push(`Items removed: ${result.itemsRemoved}`);
      }

      return {
        success: true,
        documentType,
        id: documentId,
        name: result.name,
        updatedFields: result.updatedFields,
        itemsAdded: result.itemsAdded,
        itemsRemoved: result.itemsRemoved,
        message: parts.join('. '),
      };
    } catch (error) {
      this.errorHandler.handleToolError(error, 'update-document', 'document update');
    }
  }
}
