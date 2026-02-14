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
        name: 'batch-create-documents',
        description: 'Batch create multiple Foundry VTT documents at once. Much faster than calling create-document repeatedly. All documents must be the same type (Actor or Item). Documents are created in a single Foundry API call.',
        inputSchema: {
          type: 'object',
          properties: {
            documentType: {
              type: 'string',
              enum: ['Actor', 'Item'],
              description: 'The Foundry document type to create',
            },
            documents: {
              type: 'array',
              items: {
                type: 'object',
              },
              description: 'Array of document data objects. Each must include "name" and "type" fields.',
            },
            folderId: {
              type: 'string',
              description: 'Optional folder ID to place all created documents in.',
            },
          },
          required: ['documentType', 'documents'],
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
      {
        name: 'delete-document',
        description: 'Delete a Foundry VTT document (Actor or Item) by ID. This is permanent and cannot be undone.',
        inputSchema: {
          type: 'object',
          properties: {
            documentType: {
              type: 'string',
              enum: ['Actor', 'Item'],
              description: 'The Foundry document type to delete',
            },
            documentId: {
              type: 'string',
              description: 'ID of the document to delete',
            },
          },
          required: ['documentType', 'documentId'],
        },
      },
      {
        name: 'browse-files',
        description: 'Browse files and directories in Foundry VTT. Use this to discover available icons, images, and other assets. Returns lists of files and subdirectories at the given path.',
        inputSchema: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              enum: ['public', 'data'],
              description: 'File storage source. "public" for core Foundry assets (icons, etc.), "data" for user-uploaded files. Defaults to "public".',
            },
            target: {
              type: 'string',
              description: 'Directory path to browse (e.g., "icons/creatures/mammals", "icons/magic"). Defaults to root.',
            },
            extensions: {
              type: 'array',
              items: { type: 'string' },
              description: 'Optional file extension filter (e.g., [".webp", ".png"]).',
            },
          },
          required: ['target'],
        },
      },
      {
        name: 'create-folder',
        description: 'Create a folder in Foundry VTT to organize documents. Supports nested folders via the parent parameter.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the folder to create',
            },
            type: {
              type: 'string',
              enum: ['Actor', 'Item', 'Scene', 'JournalEntry', 'RollTable', 'Compendium'],
              description: 'The document type this folder will contain',
            },
            parent: {
              type: 'string',
              description: 'ID of the parent folder for nesting. Omit for top-level folders.',
            },
          },
          required: ['name', 'type'],
        },
      },
      {
        name: 'list-folders',
        description: 'List all folders in the world, optionally filtered by document type.',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['Actor', 'Item', 'Scene', 'JournalEntry', 'RollTable', 'Compendium'],
              description: 'Filter by folder type',
            },
          },
        },
      },
      {
        name: 'delete-folder',
        description: 'Delete a folder from the world. By default, contents are moved to the parent folder. Use deleteContents to also delete all items within.',
        inputSchema: {
          type: 'object',
          properties: {
            folderId: {
              type: 'string',
              description: 'ID of the folder to delete',
            },
            deleteContents: {
              type: 'boolean',
              description: 'If true, also delete all documents within the folder. If false (default), contents are moved to the parent folder.',
            },
          },
          required: ['folderId'],
        },
      },
      {
        name: 'export-folder-to-compendium',
        description: 'Export all documents from a world folder into a compendium pack. By default recursively includes all subfolders. Use this to populate module compendium packs from world content.',
        inputSchema: {
          type: 'object',
          properties: {
            folderId: {
              type: 'string',
              description: 'ID of the world folder to export from',
            },
            packId: {
              type: 'string',
              description: 'Full compendium pack ID (e.g., "my-module.pack-name")',
            },
            recursive: {
              type: 'boolean',
              description: 'Whether to include documents from subfolders (default: true)',
            },
            clearFirst: {
              type: 'boolean',
              description: 'Delete all existing entries from the pack before exporting (default: false). Use to prevent duplicates on reimport.',
            },
          },
          required: ['folderId', 'packId'],
        },
      },
      {
        name: 'update-folder',
        description: 'Update a folder (rename or move to a different parent folder).',
        inputSchema: {
          type: 'object',
          properties: {
            folderId: {
              type: 'string',
              description: 'ID of the folder to update',
            },
            name: {
              type: 'string',
              description: 'New name for the folder',
            },
            parent: {
              type: 'string',
              description: 'ID of the new parent folder. Use null to move to top level.',
            },
          },
          required: ['folderId'],
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

      const response: any = {
        success: true,
        documentType,
        id: result.id,
        name: result.name,
        message: `Created ${documentType} "${result.name}" (ID: ${result.id})`,
      };

      // Include effect IDs so callers can link them to activities
      if (result.effects?.length > 0) {
        response.effects = result.effects;
      }

      return response;
    } catch (error) {
      this.errorHandler.handleToolError(error, 'create-document', 'document creation');
    }
  }

  async handleBatchCreateDocuments(args: any): Promise<any> {
    const schema = z.object({
      documentType: z.enum(['Actor', 'Item']),
      documents: z.array(z.object({
        name: z.string().min(1, 'Document name is required'),
        type: z.string().min(1, 'Document type is required'),
      }).passthrough()).min(1, 'At least one document is required'),
      folderId: z.string().optional(),
    });

    const { documentType, documents, folderId } = schema.parse(args);

    this.logger.info('Batch creating documents', {
      documentType,
      count: documents.length,
      folderId,
    });

    try {
      const result = await this.foundryClient.query('foundry-mcp-bridge.batchCreateDocuments', {
        documentType,
        documents,
        folderId,
      });

      this.logger.info('Batch creation complete', {
        documentType,
        created: result.created,
      });

      return {
        success: true,
        documentType,
        created: result.created,
        message: `Created ${result.created} ${documentType}(s)`,
        results: result.results,
      };
    } catch (error) {
      this.errorHandler.handleToolError(error, 'batch-create-documents', 'batch document creation');
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

  async handleDeleteDocument(args: any): Promise<any> {
    const schema = z.object({
      documentType: z.enum(['Actor', 'Item']),
      documentId: z.string().min(1, 'Document ID is required'),
    });

    const { documentType, documentId } = schema.parse(args);

    this.logger.info('Deleting document', { documentType, documentId });

    try {
      const result = await this.foundryClient.query('foundry-mcp-bridge.deleteDocument', {
        documentType,
        documentId,
      });

      this.logger.info('Document deleted', {
        documentType,
        documentId,
        name: result.name,
      });

      return {
        success: true,
        documentType,
        id: documentId,
        name: result.name,
        message: `Deleted ${documentType} "${result.name}" (ID: ${documentId})`,
      };
    } catch (error) {
      this.errorHandler.handleToolError(error, 'delete-document', 'document deletion');
    }
  }

  async handleBrowseFiles(args: any): Promise<any> {
    const schema = z.object({
      source: z.enum(['public', 'data']).optional().default('public'),
      target: z.string().default(''),
      extensions: z.array(z.string()).optional(),
    });

    const { source, target, extensions } = schema.parse(args);

    this.logger.info('Browsing files', { source, target, extensions });

    try {
      const result = await this.foundryClient.query('foundry-mcp-bridge.browseFiles', {
        source,
        target,
        extensions,
      });

      return {
        target: result.target,
        dirs: result.dirs,
        files: result.files,
        fileCount: result.files.length,
        dirCount: result.dirs.length,
      };
    } catch (error) {
      this.errorHandler.handleToolError(error, 'browse-files', 'file browsing');
    }
  }

  async handleCreateFolder(args: any): Promise<any> {
    const schema = z.object({
      name: z.string().min(1, 'Folder name is required'),
      type: z.string().min(1, 'Folder type is required'),
      parent: z.string().optional(),
    });

    const { name, type, parent } = schema.parse(args);

    this.logger.info('Creating folder', { name, type, parent });

    try {
      const result = await this.foundryClient.query('foundry-mcp-bridge.createFolder', {
        name,
        type,
        parent: parent || null,
      });

      return {
        success: true,
        id: result.id,
        name: result.name,
        type: result.type,
        parent: result.parent,
        message: `Created ${type} folder "${result.name}" (ID: ${result.id})`,
      };
    } catch (error) {
      this.errorHandler.handleToolError(error, 'create-folder', 'folder creation');
    }
  }

  async handleListFolders(args: any): Promise<any> {
    const schema = z.object({
      type: z.string().optional(),
    });

    const { type } = schema.parse(args);

    this.logger.info('Listing folders', { type });

    try {
      const result = await this.foundryClient.query('foundry-mcp-bridge.listFolders', {
        type,
      });

      return {
        folders: result.folders,
        count: result.folders.length,
      };
    } catch (error) {
      this.errorHandler.handleToolError(error, 'list-folders', 'folder listing');
    }
  }

  async handleDeleteFolder(args: any): Promise<any> {
    const schema = z.object({
      folderId: z.string().min(1, 'Folder ID is required'),
      deleteContents: z.boolean().optional().default(false),
    });

    const { folderId, deleteContents } = schema.parse(args);

    this.logger.info('Deleting folder', { folderId, deleteContents });

    try {
      const result = await this.foundryClient.query('foundry-mcp-bridge.deleteFolder', {
        folderId,
        deleteContents,
      });

      return {
        success: true,
        id: folderId,
        name: result.name,
        message: `Deleted folder "${result.name}" (ID: ${folderId})${deleteContents ? ' and all contents' : ''}`,
      };
    } catch (error) {
      this.errorHandler.handleToolError(error, 'delete-folder', 'folder deletion');
    }
  }

  async handleExportFolderToCompendium(args: any): Promise<any> {
    const schema = z.object({
      folderId: z.string().min(1, 'Folder ID is required'),
      packId: z.string().min(1, 'Pack ID is required'),
      recursive: z.boolean().optional().default(true),
      clearFirst: z.boolean().optional().default(false),
    });

    const { folderId, packId, recursive, clearFirst } = schema.parse(args);

    this.logger.info('Exporting folder to compendium', { folderId, packId, recursive, clearFirst });

    try {
      const result = await this.foundryClient.query('foundry-mcp-bridge.exportFolderToCompendium', {
        folderId,
        packId,
        recursive,
        clearFirst,
      });

      return {
        success: true,
        exported: result.exported,
        folderName: result.folderName,
        packId: result.packId,
        message: result.message,
      };
    } catch (error) {
      this.errorHandler.handleToolError(error, 'export-folder-to-compendium', 'folder export to compendium');
    }
  }

  async handleUpdateFolder(args: any): Promise<any> {
    const schema = z.object({
      folderId: z.string().min(1, 'Folder ID is required'),
      name: z.string().optional(),
      parent: z.string().nullable().optional(),
    });

    const { folderId, name, parent } = schema.parse(args);

    this.logger.info('Updating folder', { folderId, name, parent });

    try {
      const result = await this.foundryClient.query('foundry-mcp-bridge.updateFolder', {
        folderId,
        name,
        parent,
      });

      return {
        success: true,
        id: result.id,
        name: result.name,
        type: result.type,
        parent: result.parent,
        message: `Updated folder "${result.name}" (ID: ${result.id})`,
      };
    } catch (error) {
      this.errorHandler.handleToolError(error, 'update-folder', 'folder update');
    }
  }
}
