import { FoundryClient } from '../foundry-client.js';
import { Logger } from '../logger.js';
import { z } from 'zod';

export class DiagnosticTools {
  private foundryClient: FoundryClient;
  private logger: Logger;

  constructor(foundryClient: FoundryClient, logger: Logger) {
    this.foundryClient = foundryClient;
    this.logger = logger.child({ component: 'DiagnosticTools' });
  }

  getToolDefinitions() {
    return [
      {
        name: 'check-bridge-status',
        description: 'Check the connection status of the Foundry VTT bridge module. Returns detailed connection info including latency if connected.',
        inputSchema: {
          type: 'object',
          properties: {
            echo: {
              type: 'string',
              description: 'Optional message to echo back to verify data channel round-trip',
            },
          },
        },
      },
    ];
  }

  async handleCheckBridgeStatus(args: any): Promise<any> {
    const schema = z.object({
      echo: z.string().optional(),
    });

    const { echo } = schema.parse(args);

    const connectionInfo = this.foundryClient.getConnectionInfo();
    const isConnected = this.foundryClient.isConnected();

    if (!isConnected) {
      return {
        content: [
          {
            type: 'text',
            text: `Bridge Status: ❌ DISCONNECTED\n\nConnection Info:\n${JSON.stringify(connectionInfo, null, 2)}`,
          },
        ],
        isError: true,
      };
    }

    try {
      const startTime = Date.now();
      const pingResult = await this.foundryClient.ping();
      const latency = Date.now() - startTime;

      let echoResult = null;
      if (echo) {
        echoResult = await this.foundryClient.query('foundry-mcp-bridge.echo', { message: echo });
      }

      const statusText = [
        `Bridge Status: ✅ CONNECTED (${connectionInfo.connectionType})`,
        `Latency: ${latency}ms`,
        `Foundry Version: ${pingResult.foundryVersion}`,
        `World: ${pingResult.worldId}`,
        `User: ${pingResult.userId}`,
        echo ? `Echo Result: ${JSON.stringify(echoResult.echo)}` : null,
      ].filter(Boolean).join('\n');

      return {
        content: [
          {
            type: 'text',
            text: statusText,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Bridge Status: ⚠️ CONNECTED (Handshake failed)\n\nError: ${error.message}\n\nConnection Info:\n${JSON.stringify(connectionInfo, null, 2)}`,
          },
        ],
        isError: true,
      };
    }
  }
}
