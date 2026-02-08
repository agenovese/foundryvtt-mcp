import { z } from 'zod';
import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { ErrorHandler } from '../utils/error-handler.js';

export interface AdventureImportToolsOptions {
  foundryClient: FoundryClient;
  logger: Logger;
}

export class AdventureImportTools {
  private foundryClient: FoundryClient;
  private logger: Logger;
  private errorHandler: ErrorHandler;

  constructor({ foundryClient, logger }: AdventureImportToolsOptions) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'AdventureImportTools' });
    this.errorHandler = new ErrorHandler(this.logger);
  }

  getToolDefinitions() {
    return [
      {
        name: 'create-journal-entry',
        description: 'Create a multi-page journal entry using Foundry v10+ JournalEntryPage system. Supports text and image pages. Content should use ProseMirror-compatible HTML. Supported CSS classes: .readaloud (boxed read-aloud text), .gmnote (GM-only notes), .spaced (section headers), .grid-2 (two-column layout). Supports @UUID linking syntax for cross-references.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the journal entry',
            },
            pages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Page title',
                  },
                  type: {
                    type: 'string',
                    enum: ['text', 'image'],
                    description: 'Page type: "text" for HTML content, "image" for an image page',
                  },
                  content: {
                    type: 'string',
                    description: 'HTML content for text pages. Use ProseMirror-compatible HTML.',
                  },
                  src: {
                    type: 'string',
                    description: 'Image source path for image pages (Foundry-relative path)',
                  },
                  caption: {
                    type: 'string',
                    description: 'Caption for image pages',
                  },
                },
                required: ['name', 'type'],
              },
              description: 'Array of journal pages to create',
            },
            folder: {
              type: 'string',
              description: 'Optional folder ID to place the journal entry in',
            },
            folderName: {
              type: 'string',
              description: 'Optional folder name. Will find or create the folder.',
            },
            ownership: {
              type: 'object',
              description: 'Optional ownership settings. Default: GM only ({ default: 0 })',
            },
          },
          required: ['name', 'pages'],
        },
      },
      {
        name: 'create-roll-table',
        description: 'Create a roll table with embedded results. Supports text results, document links, and compendium links.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the roll table',
            },
            formula: {
              type: 'string',
              description: 'Dice formula for the table (e.g., "1d8", "1d20", "2d6")',
            },
            description: {
              type: 'string',
              description: 'Description of the roll table',
            },
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  range: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'Two-element array [low, high] for the result range',
                  },
                  text: {
                    type: 'string',
                    description: 'Result text displayed when rolled',
                  },
                  type: {
                    type: 'number',
                    description: 'Result type: 0 = text (default), 1 = document link, 2 = compendium link',
                  },
                  documentCollection: {
                    type: 'string',
                    description: 'For type 1/2: the document collection (e.g., "Actor", "Item") or compendium pack ID',
                  },
                  documentId: {
                    type: 'string',
                    description: 'For type 1/2: the document ID to link to',
                  },
                  img: {
                    type: 'string',
                    description: 'Optional icon path for this result',
                  },
                  weight: {
                    type: 'number',
                    description: 'Weight for weighted random draws (default: 1)',
                  },
                },
                required: ['range', 'text'],
              },
              description: 'Array of table results',
            },
            folder: {
              type: 'string',
              description: 'Optional folder ID to place the roll table in',
            },
            folderName: {
              type: 'string',
              description: 'Optional folder name. Will find or create the folder.',
            },
            img: {
              type: 'string',
              description: 'Optional image/icon for the roll table',
            },
            replacement: {
              type: 'boolean',
              description: 'Whether results can be drawn more than once (default: true)',
            },
            displayRoll: {
              type: 'boolean',
              description: 'Whether to display the roll result in chat (default: true)',
            },
          },
          required: ['name', 'formula', 'results'],
        },
      },
      {
        name: 'upload-file',
        description: 'Upload a file to the Foundry VTT data directory. Accepts base64-encoded file data. Supports images (png, jpg, jpeg, webp, svg, gif), audio (mp3, wav, ogg, flac, m4a), video (mp4, webm), and PDF files. Creates target directories if needed. Returns the Foundry-relative file path.',
        inputSchema: {
          type: 'object',
          properties: {
            filename: {
              type: 'string',
              description: 'Filename with extension (e.g., "pirate-fort.jpg", "ambiance.mp3")',
            },
            base64data: {
              type: 'string',
              description: 'Base64-encoded file content',
            },
            targetPath: {
              type: 'string',
              description: 'Target directory path within the data directory (e.g., "modules/my-adventures/maps", "worlds/myworld/assets"). Directories are created if needed.',
            },
          },
          required: ['filename', 'base64data', 'targetPath'],
        },
      },
      {
        name: 'create-scene',
        description: 'Create a Foundry VTT scene from a background image. The image must already be uploaded (use upload-file first). Auto-calculates scene dimensions from the image if width/height are not provided.',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Scene name',
            },
            backgroundImage: {
              type: 'string',
              description: 'Foundry-relative path to the background image (e.g., "modules/my-adventures/maps/pirate-fort.jpg")',
            },
            gridSize: {
              type: 'number',
              description: 'Pixels per grid square (default: 100). Calculate from your map: if a 5ft square is 70px wide in the image, set gridSize to 70.',
            },
            gridType: {
              type: 'number',
              description: 'Grid type: 0 = gridless, 1 = square (default), 2 = hex rows odd, 3 = hex rows even, 4 = hex cols odd, 5 = hex cols even',
            },
            width: {
              type: 'number',
              description: 'Scene width in pixels. If omitted, auto-detected from image.',
            },
            height: {
              type: 'number',
              description: 'Scene height in pixels. If omitted, auto-detected from image.',
            },
            padding: {
              type: 'number',
              description: 'Scene padding ratio (0 to 0.5). Default: 0.25',
            },
            globalLight: {
              type: 'boolean',
              description: 'Whether the scene has global illumination (default: true)',
            },
            globalLightThreshold: {
              type: 'number',
              description: 'Light threshold for token vision. null = no threshold.',
            },
            initialViewPosition: {
              type: 'object',
              properties: {
                x: { type: 'number' },
                y: { type: 'number' },
                scale: { type: 'number' },
              },
              description: 'Initial camera position when the scene is viewed',
            },
            folder: {
              type: 'string',
              description: 'Optional folder ID for the scene',
            },
            folderName: {
              type: 'string',
              description: 'Optional folder name. Will find or create the folder.',
            },
            gridUnits: {
              type: 'string',
              description: 'Grid distance units label (default: "ft")',
            },
            gridDistance: {
              type: 'number',
              description: 'Distance each grid square represents (default: 5)',
            },
          },
          required: ['name', 'backgroundImage'],
        },
      },
    ];
  }

  async handleCreateJournalEntry(args: any): Promise<any> {
    const pageSchema = z.object({
      name: z.string().min(1, 'Page name is required'),
      type: z.enum(['text', 'image']),
      content: z.string().optional(),
      src: z.string().optional(),
      caption: z.string().optional(),
    });

    const schema = z.object({
      name: z.string().min(1, 'Journal entry name is required'),
      pages: z.array(pageSchema).min(1, 'At least one page is required'),
      folder: z.string().optional(),
      folderName: z.string().optional(),
      ownership: z.record(z.any()).optional(),
    });

    const { name, pages, folder, folderName, ownership } = schema.parse(args);

    this.logger.info('Creating journal entry', {
      name,
      pageCount: pages.length,
      folder,
      folderName,
    });

    try {
      const result = await this.foundryClient.query('foundry-mcp-bridge.createJournalEntryMultiPage', {
        name,
        pages,
        folder,
        folderName,
        ownership,
      });

      this.logger.info('Journal entry created', {
        id: result.id,
        name: result.name,
        pageCount: result.pageCount,
      });

      return {
        success: true,
        id: result.id,
        name: result.name,
        pageCount: result.pageCount,
        pageIds: result.pageIds,
        message: `Created journal entry "${result.name}" with ${result.pageCount} pages (ID: ${result.id})`,
      };
    } catch (error) {
      this.errorHandler.handleToolError(error, 'create-journal-entry', 'journal entry creation');
    }
  }

  async handleCreateRollTable(args: any): Promise<any> {
    const resultSchema = z.object({
      range: z.array(z.number()).length(2),
      text: z.string(),
      type: z.number().optional().default(0),
      documentCollection: z.string().optional(),
      documentId: z.string().optional(),
      img: z.string().optional(),
      weight: z.number().optional().default(1),
    });

    const schema = z.object({
      name: z.string().min(1, 'Roll table name is required'),
      formula: z.string().min(1, 'Formula is required'),
      description: z.string().optional().default(''),
      results: z.array(resultSchema).min(1, 'At least one result is required'),
      folder: z.string().optional(),
      folderName: z.string().optional(),
      img: z.string().optional(),
      replacement: z.boolean().optional().default(true),
      displayRoll: z.boolean().optional().default(true),
    });

    const { name, formula, description, results, folder, folderName, img, replacement, displayRoll } = schema.parse(args);

    this.logger.info('Creating roll table', {
      name,
      formula,
      resultCount: results.length,
    });

    try {
      const result = await this.foundryClient.query('foundry-mcp-bridge.createRollTable', {
        name,
        formula,
        description,
        results,
        folder,
        folderName,
        img,
        replacement,
        displayRoll,
      });

      this.logger.info('Roll table created', {
        id: result.id,
        name: result.name,
        resultCount: result.resultCount,
      });

      return {
        success: true,
        id: result.id,
        name: result.name,
        formula: result.formula,
        resultCount: result.resultCount,
        message: `Created roll table "${result.name}" with ${result.resultCount} results (ID: ${result.id})`,
      };
    } catch (error) {
      this.errorHandler.handleToolError(error, 'create-roll-table', 'roll table creation');
    }
  }

  async handleUploadFile(args: any): Promise<any> {
    const schema = z.object({
      filename: z.string().min(1, 'Filename is required'),
      base64data: z.string().min(1, 'File data is required'),
      targetPath: z.string().min(1, 'Target path is required'),
    });

    const { filename, base64data, targetPath } = schema.parse(args);

    this.logger.info('Uploading file', {
      filename,
      targetPath,
      dataLength: base64data.length,
    });

    try {
      const result = await this.foundryClient.query('foundry-mcp-bridge.uploadFile', {
        filename,
        base64data,
        targetPath,
      });

      this.logger.info('File uploaded', {
        path: result.path,
        filename: result.filename,
      });

      return {
        success: true,
        path: result.path,
        filename: result.filename,
        message: `Uploaded "${result.filename}" to ${result.path}`,
      };
    } catch (error) {
      this.errorHandler.handleToolError(error, 'upload-file', 'file upload');
    }
  }

  async handleCreateScene(args: any): Promise<any> {
    const schema = z.object({
      name: z.string().min(1, 'Scene name is required'),
      backgroundImage: z.string().min(1, 'Background image path is required'),
      gridSize: z.number().optional().default(100),
      gridType: z.number().optional().default(1),
      width: z.number().optional(),
      height: z.number().optional(),
      padding: z.number().optional().default(0.25),
      globalLight: z.boolean().optional().default(true),
      globalLightThreshold: z.number().nullable().optional(),
      initialViewPosition: z.object({
        x: z.number(),
        y: z.number(),
        scale: z.number().optional(),
      }).optional(),
      folder: z.string().optional(),
      folderName: z.string().optional(),
      gridUnits: z.string().optional().default('ft'),
      gridDistance: z.number().optional().default(5),
    });

    const parsed = schema.parse(args);

    this.logger.info('Creating scene', {
      name: parsed.name,
      backgroundImage: parsed.backgroundImage,
      gridSize: parsed.gridSize,
    });

    try {
      const result = await this.foundryClient.query('foundry-mcp-bridge.createScene', {
        ...parsed,
      });

      this.logger.info('Scene created', {
        id: result.id,
        name: result.name,
        dimensions: `${result.width}x${result.height}`,
      });

      return {
        success: true,
        id: result.id,
        name: result.name,
        width: result.width,
        height: result.height,
        gridSize: result.gridSize,
        message: `Created scene "${result.name}" (${result.width}x${result.height}, grid: ${result.gridSize}px) (ID: ${result.id})`,
      };
    } catch (error) {
      this.errorHandler.handleToolError(error, 'create-scene', 'scene creation');
    }
  }
}
