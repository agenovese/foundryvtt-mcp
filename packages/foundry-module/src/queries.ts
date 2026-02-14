import { MODULE_ID } from './constants.js';
import { FoundryDataAccess } from './data-access.js';
import { ComfyUIManager } from './comfyui-manager.js';

export class QueryHandlers {
  public dataAccess: FoundryDataAccess;
  private comfyuiManager: ComfyUIManager;

  constructor() {
    this.dataAccess = new FoundryDataAccess();
    this.comfyuiManager = new ComfyUIManager();
  }

  /**
   * SECURITY: Validate GM access - returns silent failure for non-GM users
   */
  private validateGMAccess(): { allowed: boolean; error?: any } {
    if (!game.user?.isGM) {
      // Silent failure - no error message for non-GM users
      return { allowed: false };
    }
    return { allowed: true };
  }

  /**
   * Register all query handlers in CONFIG.queries
   */
  registerHandlers(): void {
    const modulePrefix = MODULE_ID;

    // Character/Actor queries
    CONFIG.queries[`${modulePrefix}.getCharacterInfo`] = this.handleGetCharacterInfo.bind(this);
    CONFIG.queries[`${modulePrefix}.listActors`] = this.handleListActors.bind(this);

    // Compendium queries
    CONFIG.queries[`${modulePrefix}.searchCompendium`] = this.handleSearchCompendium.bind(this);
    CONFIG.queries[`${modulePrefix}.listCreaturesByCriteria`] = this.handleListCreaturesByCriteria.bind(this);
    CONFIG.queries[`${modulePrefix}.getAvailablePacks`] = this.handleGetAvailablePacks.bind(this);
    CONFIG.queries[`${modulePrefix}.listCompendiumEntries`] = this.handleListCompendiumEntries.bind(this);

    // Scene queries
    CONFIG.queries[`${modulePrefix}.getActiveScene`] = this.handleGetActiveScene.bind(this);
    CONFIG.queries[`${modulePrefix}.list-scenes`] = this.handleListScenes.bind(this);
    CONFIG.queries[`${modulePrefix}.switch-scene`] = this.handleSwitchScene.bind(this);

    // World queries
    CONFIG.queries[`${modulePrefix}.getWorldInfo`] = this.handleGetWorldInfo.bind(this);

    // Utility queries
    CONFIG.queries[`${modulePrefix}.ping`] = this.handlePing.bind(this);

    // Phase 2 & 3: Write operation queries
    CONFIG.queries[`${modulePrefix}.createActorFromCompendium`] = this.handleCreateActorFromCompendium.bind(this);
    CONFIG.queries[`${modulePrefix}.getCompendiumDocumentFull`] = this.handleGetCompendiumDocumentFull.bind(this);
    CONFIG.queries[`${modulePrefix}.addActorsToScene`] = this.handleAddActorsToScene.bind(this);
    CONFIG.queries[`${modulePrefix}.validateWritePermissions`] = this.handleValidateWritePermissions.bind(this);
    CONFIG.queries[`${modulePrefix}.createJournalEntry`] = this.handleCreateJournalEntry.bind(this);
    CONFIG.queries[`${modulePrefix}.listJournals`] = this.handleListJournals.bind(this);
    CONFIG.queries[`${modulePrefix}.getJournalContent`] = this.handleGetJournalContent.bind(this);
    CONFIG.queries[`${modulePrefix}.updateJournalContent`] = this.handleUpdateJournalContent.bind(this);

    // Phase 4: Dice roll queries
    CONFIG.queries[`${modulePrefix}.request-player-rolls`] = this.handleRequestPlayerRolls.bind(this);

    // Enhanced creature index for campaign analysis
    CONFIG.queries[`${modulePrefix}.getEnhancedCreatureIndex`] = this.handleGetEnhancedCreatureIndex.bind(this);
    
    // Campaign management queries
    CONFIG.queries[`${modulePrefix}.updateCampaignProgress`] = this.handleUpdateCampaignProgress.bind(this);


    // Phase 6: Actor ownership management
    CONFIG.queries[`${modulePrefix}.setActorOwnership`] = this.handleSetActorOwnership.bind(this);
    CONFIG.queries[`${modulePrefix}.getActorOwnership`] = this.handleGetActorOwnership.bind(this);
    CONFIG.queries[`${modulePrefix}.getFriendlyNPCs`] = this.handleGetFriendlyNPCs.bind(this);
    CONFIG.queries[`${modulePrefix}.getPartyCharacters`] = this.handleGetPartyCharacters.bind(this);
    CONFIG.queries[`${modulePrefix}.getConnectedPlayers`] = this.handleGetConnectedPlayers.bind(this);
    CONFIG.queries[`${modulePrefix}.findPlayers`] = this.handleFindPlayers.bind(this);
    CONFIG.queries[`${modulePrefix}.findActor`] = this.handleFindActor.bind(this);

    // Token manipulation queries
    CONFIG.queries[`${modulePrefix}.moveToken`] = this.handleMoveToken.bind(this);
    CONFIG.queries[`${modulePrefix}.updateToken`] = this.handleUpdateToken.bind(this);
    CONFIG.queries[`${modulePrefix}.deleteTokens`] = this.handleDeleteTokens.bind(this);
    CONFIG.queries[`${modulePrefix}.getTokenDetails`] = this.handleGetTokenDetails.bind(this);
    CONFIG.queries[`${modulePrefix}.toggleTokenCondition`] = this.handleToggleTokenCondition.bind(this);
    CONFIG.queries[`${modulePrefix}.getAvailableConditions`] = this.handleGetAvailableConditions.bind(this);

    // Map generation queries (hybrid architecture)
    CONFIG.queries[`${modulePrefix}.generate-map`] = this.handleGenerateMap.bind(this);
    CONFIG.queries[`${modulePrefix}.check-map-status`] = this.handleCheckMapStatus.bind(this);
    CONFIG.queries[`${modulePrefix}.cancel-map-job`] = this.handleCancelMapJob.bind(this);
    CONFIG.queries[`${modulePrefix}.upload-generated-map`] = this.handleUploadGeneratedMap.bind(this);

    // Item usage queries
    CONFIG.queries[`${modulePrefix}.useItem`] = this.handleUseItem.bind(this);

    // Character search queries
    CONFIG.queries[`${modulePrefix}.searchCharacterItems`] = this.handleSearchCharacterItems.bind(this);

    // Document management queries
    CONFIG.queries[`${modulePrefix}.createDocument`] = this.handleCreateDocument.bind(this);
    CONFIG.queries[`${modulePrefix}.batchCreateDocuments`] = this.handleBatchCreateDocuments.bind(this);
    CONFIG.queries[`${modulePrefix}.updateDocument`] = this.handleUpdateDocument.bind(this);
    CONFIG.queries[`${modulePrefix}.deleteDocument`] = this.handleDeleteDocument.bind(this);
    CONFIG.queries[`${modulePrefix}.browseFiles`] = this.handleBrowseFiles.bind(this);
    CONFIG.queries[`${modulePrefix}.createFolder`] = this.handleCreateFolder.bind(this);
    CONFIG.queries[`${modulePrefix}.listFolders`] = this.handleListFolders.bind(this);
    CONFIG.queries[`${modulePrefix}.deleteFolder`] = this.handleDeleteFolder.bind(this);
    CONFIG.queries[`${modulePrefix}.updateFolder`] = this.handleUpdateFolder.bind(this);
    CONFIG.queries[`${modulePrefix}.exportFolderToCompendium`] = this.handleExportFolderToCompendium.bind(this);

    // Adventure import queries
    CONFIG.queries[`${modulePrefix}.createJournalEntryMultiPage`] = this.handleCreateJournalEntryMultiPage.bind(this);
    CONFIG.queries[`${modulePrefix}.createRollTable`] = this.handleCreateRollTable.bind(this);
    CONFIG.queries[`${modulePrefix}.uploadFile`] = this.handleUploadFile.bind(this);
    CONFIG.queries[`${modulePrefix}.createScene`] = this.handleCreateScene.bind(this);
    CONFIG.queries[`${modulePrefix}.placeNotes`] = this.handlePlaceNotes.bind(this);
    CONFIG.queries[`${modulePrefix}.createWalls`] = this.handleCreateWalls.bind(this);
    CONFIG.queries[`${modulePrefix}.createLights`] = this.handleCreateLights.bind(this);
    CONFIG.queries[`${modulePrefix}.createTokens`] = this.handleCreateTokens.bind(this);
    CONFIG.queries[`${modulePrefix}.updateCompendiumEntry`] = this.handleUpdateCompendiumEntry.bind(this);

    // Phase 7: Token manipulation queries
    CONFIG.queries[`${modulePrefix}.move-token`] = this.handleMoveToken.bind(this);
    CONFIG.queries[`${modulePrefix}.update-token`] = this.handleUpdateToken.bind(this);
    CONFIG.queries[`${modulePrefix}.delete-tokens`] = this.handleDeleteTokens.bind(this);
    CONFIG.queries[`${modulePrefix}.get-token-details`] = this.handleGetTokenDetails.bind(this);
    CONFIG.queries[`${modulePrefix}.toggle-token-condition`] = this.handleToggleTokenCondition.bind(this);
    CONFIG.queries[`${modulePrefix}.get-available-conditions`] = this.handleGetAvailableConditions.bind(this);

  }

  /**
   * Unregister all query handlers
   */
  unregisterHandlers(): void {
    const modulePrefix = MODULE_ID;
    const keysToRemove = Object.keys(CONFIG.queries).filter(key => key.startsWith(modulePrefix));
    
    for (const key of keysToRemove) {
      delete CONFIG.queries[key];
    }

  }

  /**
   * Handle query requests from other parts of the module
   */
  async handleQuery(queryName: string, data: any): Promise<any> {
    try {
      const handler = CONFIG.queries[queryName];
      if (!handler || typeof handler !== 'function') {
        throw new Error(`Query handler not found: ${queryName}`);
      }

      return await handler(data);
    } catch (error) {
      console.error(`[${MODULE_ID}] Query failed: ${queryName}`, error);
      return { 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      };
    }
  }

  /**
   * Handle character information request
   */
  private async handleGetCharacterInfo(data: { characterName?: string; characterId?: string }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      const identifier = data.characterName || data.characterId;
      if (!identifier) {
        throw new Error('characterName or characterId is required');
      }

      return await this.dataAccess.getCharacterInfo(identifier);
    } catch (error) {
      throw new Error(`Failed to get character info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle list actors request
   */
  private async handleListActors(data: { type?: string }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      const actors = await this.dataAccess.listActors();
      
      // Filter by type if specified
      if (data.type) {
        return actors.filter(actor => actor.type === data.type);
      }

      return actors;
    } catch (error) {
      throw new Error(`Failed to list actors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle compendium search request
   */
  private async handleSearchCompendium(data: { 
    query: string; 
    packType?: string;
    filters?: {
      challengeRating?: number | { min?: number; max?: number };
      creatureType?: string;
      size?: string;
      alignment?: string;
      hasLegendaryActions?: boolean;
      spellcaster?: boolean;
    }
  }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      // Add better parameter validation
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data parameter structure');
      }

      if (!data.query || typeof data.query !== 'string') {
        throw new Error('query parameter is required and must be a string');
      }


      return await this.dataAccess.searchCompendium(data.query, data.packType, data.filters);
    } catch (error) {
      throw new Error(`Failed to search compendium: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle list creatures by criteria request
   */
  private async handleListCreaturesByCriteria(data: {
    challengeRating?: number | { min?: number; max?: number };
    creatureType?: string;
    size?: string;
    hasSpells?: boolean;
    hasLegendaryActions?: boolean;
    limit?: number;
  }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();


      const result = await this.dataAccess.listCreaturesByCriteria(data);
      
      // Handle the new format with search summary
      return {
        response: result
      };
    } catch (error) {
      throw new Error(`Failed to list creatures by criteria: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get available packs request
   */
  private async handleGetAvailablePacks(): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();
      return await this.dataAccess.getAvailablePacks();
    } catch (error) {
      throw new Error(`Failed to get available packs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle list compendium entries request
   */
  private async handleListCompendiumEntries(data: { packId: string; type?: string }): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();
      return await this.dataAccess.listCompendiumEntries(data.packId, data.type);
    } catch (error) {
      throw new Error(`Failed to list compendium entries: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get active scene request
   */
  private async handleGetActiveScene(): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();
      return await this.dataAccess.getActiveScene();
    } catch (error) {
      throw new Error(`Failed to get active scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get world info request
   */
  private async handleGetWorldInfo(): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();
      return await this.dataAccess.getWorldInfo();
    } catch (error) {
      throw new Error(`Failed to get world info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle ping request
   */
  private async handlePing(): Promise<any> {
    return {
      status: 'ok',
      timestamp: Date.now(),
      module: MODULE_ID,
      foundryVersion: game.version,
      worldId: game.world?.id,
      userId: game.user?.id,
    };
  }

  /**
   * Get list of all registered query methods
   */
  getRegisteredMethods(): string[] {
    const modulePrefix = MODULE_ID;
    return Object.keys(CONFIG.queries)
      .filter(key => key.startsWith(modulePrefix))
      .map(key => key.replace(`${modulePrefix}.`, ''));
  }

  /**
   * Test if a specific query handler is registered
   */
  isMethodRegistered(method: string): boolean {
    const queryKey = `${MODULE_ID}.${method}`;
    return queryKey in CONFIG.queries && typeof CONFIG.queries[queryKey] === 'function';
  }

  // ===== PHASE 2: WRITE OPERATION HANDLERS =====

  /**
   * Handle actor creation from specific compendium entry
   */
  private async handleCreateActorFromCompendium(data: {
    packId: string;
    itemId: string;
    customNames?: string[] | undefined;
    quantity?: number | undefined;
    addToScene?: boolean | undefined;
    placement?: {
      type: 'random' | 'grid' | 'center' | 'coordinates';
      coordinates?: { x: number; y: number }[];
    } | undefined;
  }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      // Clean interface - direct pack/item reference only
      const requestData: any = {
        packId: data.packId,
        itemId: data.itemId,
        customNames: data.customNames || [],
        quantity: data.quantity || 1,
        addToScene: data.addToScene || false,
      };
      
      if (data.placement) {
        requestData.placement = data.placement;
      }
      
      return await this.dataAccess.createActorFromCompendiumEntry(requestData);
    } catch (error) {
      throw new Error(`Failed to create actor from compendium: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get compendium document full request
   */
  private async handleGetCompendiumDocumentFull(data: {
    packId: string;
    documentId: string;
  }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.packId) {
        throw new Error('packId is required');
      }

      if (!data.documentId) {
        throw new Error('documentId is required');
      }

      return await this.dataAccess.getCompendiumDocumentFull(data.packId, data.documentId);
    } catch (error) {
      throw new Error(`Failed to get compendium document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle add actors to scene request
   */
  private async handleAddActorsToScene(data: {
    actorIds: string[];
    placement?: 'random' | 'grid' | 'center';
    hidden?: boolean;
  }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.actorIds || !Array.isArray(data.actorIds) || data.actorIds.length === 0) {
        throw new Error('actorIds array is required and must not be empty');
      }

      return await this.dataAccess.addActorsToScene({
        actorIds: data.actorIds,
        placement: data.placement || 'random',
        hidden: data.hidden || false,
      });
    } catch (error) {
      throw new Error(`Failed to add actors to scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle validate write permissions request
   */
  private async handleValidateWritePermissions(data: {
    operation: 'createActor' | 'modifyScene';
  }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.operation) {
        throw new Error('operation is required');
      }

      return await this.dataAccess.validateWritePermissions(data.operation);
    } catch (error) {
      throw new Error(`Failed to validate write permissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle journal entry creation
   */
  async handleCreateJournalEntry(data: any): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      if (!data.name) {
        throw new Error('name is required');
      }
      if (!data.content) {
        throw new Error('content is required');
      }

      return await this.dataAccess.createJournalEntry({
        name: data.name,
        content: data.content,
      });
    } catch (error) {
      throw new Error(`Failed to create journal entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle list journals request
   */
  async handleListJournals(): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();
      return await this.dataAccess.listJournals();
    } catch (error) {
      throw new Error(`Failed to list journals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get journal content request
   */
  async handleGetJournalContent(data: { journalId: string }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.journalId) {
        throw new Error('journalId is required');
      }

      return await this.dataAccess.getJournalContent(data.journalId);
    } catch (error) {
      throw new Error(`Failed to get journal content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle update journal content request
   */
  async handleUpdateJournalContent(data: { journalId: string; content: string }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.journalId) {
        throw new Error('journalId is required');
      }
      if (!data.content) {
        throw new Error('content is required');
      }

      return await this.dataAccess.updateJournalContent({
        journalId: data.journalId,
        content: data.content,
      });
    } catch (error) {
      throw new Error(`Failed to update journal content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle request player rolls - creates interactive roll buttons in chat
   */
  async handleRequestPlayerRolls(data: {
    rollType: string;
    rollTarget: string;
    targetPlayer: string;
    isPublic: boolean;
    rollModifier: string;
    flavor: string;
  }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.rollType || !data.rollTarget || !data.targetPlayer) {
        throw new Error('rollType, rollTarget, and targetPlayer are required');
      }

      return await this.dataAccess.requestPlayerRolls(data);
    } catch (error) {
      throw new Error(`Failed to request player rolls: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get enhanced creature index request
   */
  async handleGetEnhancedCreatureIndex(): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      return await this.dataAccess.getEnhancedCreatureIndex();
    } catch (error) {
      throw new Error(`Failed to get enhanced creature index: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle campaign progress update request
   */
  async handleUpdateCampaignProgress(data: { campaignId: string; partId: string; newStatus: string }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      // For now, this is a pass-through to the MCP server
      // In the future, campaign data might be stored in Foundry world flags
      // Currently, the campaign dashboard regeneration happens server-side
      

      return {
        success: true,
        message: `Campaign progress updated: ${data.partId} is now ${data.newStatus}`,
        campaignId: data.campaignId,
        partId: data.partId,
        newStatus: data.newStatus
      };

    } catch (error) {
      throw new Error(`Failed to update campaign progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle set actor ownership request
   */
  async handleSetActorOwnership(data: any): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.actorId || !data.userId || data.permission === undefined) {
        throw new Error('actorId, userId, and permission are required');
      }

      return await this.dataAccess.setActorOwnership(data);
    } catch (error) {
      throw new Error(`Failed to set actor ownership: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get actor ownership request
   */
  async handleGetActorOwnership(data: any): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      return await this.dataAccess.getActorOwnership(data);
    } catch (error) {
      throw new Error(`Failed to get actor ownership: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get friendly NPCs request
   */
  async handleGetFriendlyNPCs(): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      return await this.dataAccess.getFriendlyNPCs();
    } catch (error) {
      throw new Error(`Failed to get friendly NPCs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get party characters request
   */
  async handleGetPartyCharacters(): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      return await this.dataAccess.getPartyCharacters();
    } catch (error) {
      throw new Error(`Failed to get party characters: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get connected players request
   */
  async handleGetConnectedPlayers(): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      return await this.dataAccess.getConnectedPlayers();
    } catch (error) {
      throw new Error(`Failed to get connected players: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle find players request
   */
  async handleFindPlayers(data: any): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.identifier) {
        throw new Error('identifier is required');
      }

      return await this.dataAccess.findPlayers(data);
    } catch (error) {
      throw new Error(`Failed to find players: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle find actor request
   */
  async handleFindActor(data: any): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.identifier) {
        throw new Error('identifier is required');
      }

      return await this.dataAccess.findActor(data);
    } catch (error) {
      throw new Error(`Failed to find actor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle list scenes request
   */
  private async handleListScenes(data: any): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();
      return await this.dataAccess.listScenes(data);
    } catch (error) {
      throw new Error(`Failed to list scenes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle switch scene request
   */
  private async handleSwitchScene(data: any): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.scene_identifier) {
        throw new Error('scene_identifier is required');
      }

      return await this.dataAccess.switchScene(data);
    } catch (error) {
      throw new Error(`Failed to switch scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle map generation request - uses hybrid architecture
   */
  private async handleGenerateMap(data: any): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      if (!data.prompt || typeof data.prompt !== 'string') {
        throw new Error('Prompt is required and must be a string');
      }

      if (!data.scene_name || typeof data.scene_name !== 'string') {
        throw new Error('Scene name is required and must be a string');
      }

      // Get quality setting from module settings
      const quality = game.settings.get(MODULE_ID, 'mapGenQuality') || 'low';

      const params = {
        prompt: data.prompt.trim(),
        scene_name: data.scene_name.trim(),
        size: data.size || 'medium',
        grid_size: data.grid_size || 70,
        quality: quality
      };

      // Use ComfyUIManager to communicate with backend via WebSocket
      const response = await this.comfyuiManager.generateMap(params);
      const isSuccess = typeof response?.success === 'boolean' ? response.success : response?.status === 'success';

      if (!isSuccess) {
        const errorMessage = response?.error || response?.message || 'Map generation failed';
        return {
          error: errorMessage,
          success: false,
          status: response?.status ?? 'error'
        };
      }

      return {
        success: true,
        status: response?.status ?? 'success',
        jobId: response.jobId,
        message: response.message || 'Map generation started',
        estimatedTime: response.estimatedTime || '30-90 seconds'
      };

    } catch (error: any) {
      return {
        error: error.message,
        success: false
      };
    }
  }

  /**
   * Handle map status check request - uses hybrid architecture
   */
  private async handleCheckMapStatus(data: any): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      if (!data.job_id) {
        throw new Error('Job ID is required');
      }

      // Use ComfyUIManager to communicate with backend via WebSocket
      const response = await this.comfyuiManager.checkMapStatus(data);
      const isSuccess = typeof response?.success === 'boolean' ? response.success : response?.status === 'success';

      if (!isSuccess) {
        const errorMessage = response?.error || response?.message || 'Status check failed';
        return {
          error: errorMessage,
          success: false,
          status: response?.status ?? 'error'
        };
      }

      return {
        success: true,
        status: response?.status ?? 'success',
        job: response.job
      };

    } catch (error: any) {
      return {
        error: error.message,
        success: false
      };
    }
  }

  /**
   * Handle map job cancellation request - uses hybrid architecture
   */
  private async handleCancelMapJob(data: any): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      if (!data.job_id) {
        throw new Error('Job ID is required');
      }

      // Use ComfyUIManager to communicate with backend via WebSocket
      const response = await this.comfyuiManager.cancelMapJob(data);
      const isSuccess = typeof response?.success === 'boolean' ? response.success : response?.status === 'success';

      if (!isSuccess) {
        const errorMessage = response?.error || response?.message || 'Job cancellation failed';
        return {
          error: errorMessage,
          success: false,
          status: response?.status ?? 'error'
        };
      }

      return {
        success: true,
        status: response?.status ?? 'success',
        message: response.message || 'Job cancelled successfully'
      };

    } catch (error: any) {
      return {
        error: error.message,
        success: false
      };
    }
  }

  /**
   * Handle upload of generated map image (for remote Foundry instances)
   * Receives base64-encoded image data and saves it to generated-maps folder
   */
  private async handleUploadGeneratedMap(data: any): Promise<any> {
    console.log(`[${MODULE_ID}] Upload generated map request received`, {
      hasFilename: !!data.filename,
      hasImageData: !!data.imageData,
      imageDataLength: data.imageData?.length
    });

    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        console.error(`[${MODULE_ID}] Upload denied - not GM`);
        return { error: 'Access denied', success: false };
      }

      if (!data.filename || typeof data.filename !== 'string') {
        console.error(`[${MODULE_ID}] Upload failed - invalid filename`);
        throw new Error('Filename is required and must be a string');
      }

      if (!data.imageData || typeof data.imageData !== 'string') {
        console.error(`[${MODULE_ID}] Upload failed - invalid image data`);
        throw new Error('Image data is required and must be a base64 string');
      }

      console.log(`[${MODULE_ID}] Validating filename...`);
      // Validate filename for security (prevent path traversal)
      const safeFilename = data.filename.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
      if (!safeFilename.endsWith('.png') && !safeFilename.endsWith('.jpg') && !safeFilename.endsWith('.jpeg')) {
        throw new Error('Only PNG and JPEG images are supported');
      }

      console.log(`[${MODULE_ID}] Converting base64 to blob...`, {
        base64Length: data.imageData.length,
        estimatedSizeMB: (data.imageData.length / 1024 / 1024).toFixed(2)
      });

      // Convert base64 to Blob
      const byteCharacters = atob(data.imageData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      console.log(`[${MODULE_ID}] Creating file object...`, {
        filename: safeFilename,
        blobSize: blob.size
      });

      // Create a File object from the Blob
      const file = new File([blob], safeFilename, { type: 'image/png' });

      console.log(`[${MODULE_ID}] Ensuring upload directory exists...`);

      // Upload to world-specific folder so maps persist even if module is deleted
      // This also keeps maps organized per world
      const worldId = (game as any).world?.id || 'unknown-world';
      const uploadPath = `worlds/${worldId}/ai-generated-maps`;
      try {
        // Use the modern Foundry API (v13+) with fallback for older versions
        const FilePickerAPI = (globalThis as any).foundry?.applications?.apps?.FilePicker?.implementation || (globalThis as any).FilePicker;

        await FilePickerAPI.createDirectory('data', uploadPath, { bucket: null });
        console.log(`[${MODULE_ID}] Directory created/verified: ${uploadPath}`);
      } catch (dirError: any) {
        // Directory might already exist, that's okay
        if (!dirError.message?.includes('EEXIST') && !dirError.message?.includes('already exists')) {
          console.warn(`[${MODULE_ID}] Directory creation warning:`, dirError.message);
        }
      }

      console.log(`[${MODULE_ID}] Uploading to FilePicker...`);
      // Upload using Foundry's FilePicker.upload method with modern API
      const FilePickerAPI = (globalThis as any).foundry?.applications?.apps?.FilePicker?.implementation || (globalThis as any).FilePicker;
      const response = await FilePickerAPI.upload(
        'data',
        uploadPath,
        file,
        {},
        { notify: false }
      );

      console.log(`[${MODULE_ID}] FilePicker.upload response:`, JSON.stringify(response, null, 2));
      console.log(`[${MODULE_ID}] Response keys:`, Object.keys(response || {}));
      console.log(`[${MODULE_ID}] Uploaded generated map to:`, response.path);

      return {
        success: true,
        path: response.path,
        filename: safeFilename,
        message: `Map uploaded successfully to ${response.path}`
      };

    } catch (error: any) {
      console.error(`[${MODULE_ID}] Failed to upload generated map:`, error);
      return {
        error: error.message || 'Failed to upload generated map',
        success: false
      };
    }
  }

  // ===== PHASE 7: TOKEN MANIPULATION HANDLERS =====

  /**
   * Handle move token request
   */
  private async handleMoveToken(data: {
    tokenId: string;
    x: number;
    y: number;
    animate?: boolean
  }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.tokenId) {
        throw new Error('tokenId is required');
      }
      if (typeof data.x !== 'number' || typeof data.y !== 'number') {
        throw new Error('x and y coordinates are required and must be numbers');
      }

      return await this.dataAccess.moveToken(data);
    } catch (error) {
      throw new Error(`Failed to move token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle update token request
   */
  private async handleUpdateToken(data: {
    tokenId: string;
    updates: Record<string, any>
  }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.tokenId) {
        throw new Error('tokenId is required');
      }
      if (!data.updates || typeof data.updates !== 'object') {
        throw new Error('updates object is required');
      }

      return await this.dataAccess.updateToken(data);
    } catch (error) {
      throw new Error(`Failed to update token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle delete tokens request
   */
  private async handleDeleteTokens(data: { tokenIds: string[] }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.tokenIds || !Array.isArray(data.tokenIds) || data.tokenIds.length === 0) {
        throw new Error('tokenIds array is required and must not be empty');
      }

      return await this.dataAccess.deleteTokens(data);
    } catch (error) {
      throw new Error(`Failed to delete tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get token details request
   */
  private async handleGetTokenDetails(data: { tokenId: string }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.tokenId) {
        throw new Error('tokenId is required');
      }

      return await this.dataAccess.getTokenDetails(data);
    } catch (error) {
      throw new Error(`Failed to get token details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle toggle token condition request
   */
  private async handleToggleTokenCondition(data: {
    tokenId: string;
    conditionId: string;
    active: boolean
  }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.tokenId) {
        throw new Error('tokenId is required');
      }
      if (!data.conditionId) {
        throw new Error('conditionId is required');
      }
      if (typeof data.active !== 'boolean') {
        throw new Error('active must be a boolean');
      }

      return await this.dataAccess.toggleTokenCondition(data);
    } catch (error) {
      throw new Error(`Failed to toggle token condition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle get available conditions request
   */
  private async handleGetAvailableConditions(): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      return await this.dataAccess.getAvailableConditions();
    } catch (error) {
      throw new Error(`Failed to get available conditions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle use item request (cast spell, use ability, consume item, etc.)
   */
  private async handleUseItem(data: {
    actorIdentifier: string;
    itemIdentifier: string;
    targets?: string[];
    options?: {
      consume?: boolean;
      configureDialog?: boolean;
      spellLevel?: number;
      versatile?: boolean;
    };
  }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.actorIdentifier) {
        throw new Error('actorIdentifier is required');
      }
      if (!data.itemIdentifier) {
        throw new Error('itemIdentifier is required');
      }

      return await this.dataAccess.useItem({
        actorIdentifier: data.actorIdentifier,
        itemIdentifier: data.itemIdentifier,
        targets: data.targets,
        options: data.options,
      });
    } catch (error) {
      throw new Error(`Failed to use item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle search character items request
   */
  private async handleSearchCharacterItems(data: {
    characterIdentifier: string;
    query?: string;
    type?: string;
    category?: string;
    limit?: number;
  }): Promise<any> {
    try {
      // SECURITY: Silent GM validation
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.characterIdentifier) {
        throw new Error('characterIdentifier is required');
      }

      return await this.dataAccess.searchCharacterItems({
        characterIdentifier: data.characterIdentifier,
        query: data.query,
        type: data.type,
        category: data.category,
        limit: data.limit,
      });
    } catch (error) {
      throw new Error(`Failed to search character items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===== DOCUMENT MANAGEMENT HANDLERS =====

  /**
   * Handle generic document creation from raw JSON
   */
  private async handleCreateDocument(data: {
    documentType: 'Actor' | 'Item';
    data: Record<string, any>;
    folderName?: string;
  }): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.data || typeof data.data !== 'object') {
        throw new Error('data object is required');
      }
      if (!data.data.name || typeof data.data.name !== 'string') {
        throw new Error('data.name is required and must be a string');
      }
      if (!data.data.type || typeof data.data.type !== 'string') {
        throw new Error('data.type is required and must be a string');
      }
      if (!data.documentType || !['Actor', 'Item'].includes(data.documentType)) {
        throw new Error('documentType must be "Actor" or "Item"');
      }

      return await this.dataAccess.createDocument({
        documentType: data.documentType,
        data: data.data,
        folderName: data.folderName,
      });
    } catch (error) {
      throw new Error(`Failed to create document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle batch document creation
   */
  private async handleBatchCreateDocuments(data: {
    documentType: 'Actor' | 'Item';
    documents: Array<Record<string, any>>;
    folderId?: string;
  }): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.documentType || !['Actor', 'Item'].includes(data.documentType)) {
        throw new Error('documentType must be "Actor" or "Item"');
      }
      if (!Array.isArray(data.documents) || data.documents.length === 0) {
        throw new Error('documents array is required and must not be empty');
      }

      const batchArgs: { documentType: 'Actor' | 'Item'; documents: Array<Record<string, any>>; folderId?: string } = {
        documentType: data.documentType,
        documents: data.documents,
      };
      if (data.folderId) {
        batchArgs.folderId = data.folderId;
      }
      return await this.dataAccess.batchCreateDocuments(batchArgs);
    } catch (error) {
      throw new Error(`Failed to batch create documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle generic document update
   */
  private async handleUpdateDocument(data: {
    documentType: 'Actor' | 'Item';
    documentId: string;
    updates?: Record<string, any>;
    addItems?: Array<Record<string, any>>;
    removeItemIds?: string[];
  }): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.documentId || typeof data.documentId !== 'string') {
        throw new Error('documentId is required');
      }
      if (!data.documentType || !['Actor', 'Item'].includes(data.documentType)) {
        throw new Error('documentType must be "Actor" or "Item"');
      }
      if (!data.updates && !data.addItems && !data.removeItemIds) {
        throw new Error('At least one of updates, addItems, or removeItemIds must be provided');
      }

      return await this.dataAccess.updateDocument({
        documentType: data.documentType,
        documentId: data.documentId,
        updates: data.updates,
        addItems: data.addItems,
        removeItemIds: data.removeItemIds,
      });
    } catch (error) {
      throw new Error(`Failed to update document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle generic document deletion
   */
  private async handleDeleteDocument(data: {
    documentType: 'Actor' | 'Item';
    documentId: string;
  }): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.documentId || typeof data.documentId !== 'string') {
        throw new Error('documentId is required');
      }
      if (!data.documentType || !['Actor', 'Item'].includes(data.documentType)) {
        throw new Error('documentType must be "Actor" or "Item"');
      }

      return await this.dataAccess.deleteDocument({
        documentType: data.documentType,
        documentId: data.documentId,
      });
    } catch (error) {
      throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle file browsing via FilePicker
   */
  private async handleBrowseFiles(data: {
    source?: string;
    target: string;
    extensions?: string[];
  }): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      const source = data.source || 'public';
      const target = data.target || '';
      const options: any = {};
      if (data.extensions?.length) {
        options.extensions = data.extensions;
      }

      const result = await (FilePicker as any).browse(source, target, options);
      return {
        target: result.target,
        dirs: result.dirs || [],
        files: result.files || [],
      };
    } catch (error) {
      throw new Error(`Failed to browse files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle folder creation
   */
  private async handleCreateFolder(data: {
    name: string;
    type: string;
    parent?: string | null;
  }): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      const folderData: any = {
        name: data.name,
        type: data.type,
      };
      if (data.parent) {
        folderData.folder = data.parent;
      }

      const folder = await (Folder as any).create(folderData);
      return {
        id: folder.id,
        name: folder.name,
        type: folder.type,
        parent: folder.folder?.id || null,
      };
    } catch (error) {
      throw new Error(`Failed to create folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle listing folders
   */
  private async handleListFolders(data: {
    type?: string;
  }): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      let folders = (game as any).folders.contents as any[];
      if (data.type) {
        folders = folders.filter((f: any) => f.type === data.type);
      }
      return {
        folders: folders.map((f: any) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          parent: f.folder?.id || null,
        })),
      };
    } catch (error) {
      throw new Error(`Failed to list folders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle folder deletion
   */
  private async handleDeleteFolder(data: {
    folderId: string;
    deleteContents?: boolean;
  }): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      const folder = (game as any).folders.get(data.folderId);
      if (!folder) {
        throw new Error(`Folder not found: ${data.folderId}`);
      }

      const name = folder.name;
      await folder.delete({ deleteSubfolders: true, deleteContents: data.deleteContents || false });
      return { name };
    } catch (error) {
      throw new Error(`Failed to delete folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle folder update (rename or reparent)
   */
  private async handleExportFolderToCompendium(data: {
    folderId: string;
    packId: string;
    recursive?: boolean;
    clearFirst?: boolean;
  }): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      const folder = (game as any).folders.get(data.folderId);
      if (!folder) {
        throw new Error(`Folder not found: ${data.folderId}`);
      }

      const pack = (game as any).packs.get(data.packId);
      if (!pack) {
        throw new Error(`Compendium pack not found: ${data.packId}`);
      }

      // Collect documents from folder (and optionally subfolders)
      const docType = folder.type;
      const collection = docType === 'Actor' ? (game as any).actors : (game as any).items;
      let documents: any[];

      if (data.recursive !== false) {
        // Get all descendant folder IDs
        const folderIds = new Set<string>([data.folderId]);
        const allFolders = (game as any).folders.filter((f: any) => f.type === docType);
        let changed = true;
        while (changed) {
          changed = false;
          for (const f of allFolders) {
            if (f.folder?.id && folderIds.has(f.folder.id) && !folderIds.has(f.id)) {
              folderIds.add(f.id);
              changed = true;
            }
          }
        }
        documents = collection.filter((d: any) => d.folder?.id && folderIds.has(d.folder.id));
      } else {
        documents = collection.filter((d: any) => d.folder?.id === data.folderId);
      }

      if (documents.length === 0) {
        return {
          success: true,
          exported: 0,
          message: `No documents found in folder "${folder.name}"`,
        };
      }

      // Export documents to the compendium pack
      // Preserve valid Foundry IDs (16-char alphanumeric) for cross-referencing
      const isValidFoundryId = (id: unknown): boolean =>
        typeof id === 'string' && /^[a-zA-Z0-9]{16}$/.test(id);

      const toCreate = documents.map((d: any) => {
        const docData = d.toObject();
        if (!isValidFoundryId(docData._id)) {
          delete docData._id;
        }
        delete docData.folder;
        docData._key = undefined;
        return docData;
      });

      // Optionally clear existing pack contents before exporting
      let cleared = 0;
      if (data.clearFirst) {
        const existingIds = (await pack.getIndex()).map((e: any) => e._id);
        if (existingIds.length > 0) {
          await (pack as any).documentClass.deleteDocuments(existingIds, { pack: data.packId });
          cleared = existingIds.length;
        }
      }

      await (pack as any).documentClass.createDocuments(toCreate, { pack: data.packId });

      return {
        success: true,
        exported: toCreate.length,
        cleared,
        folderName: folder.name,
        packId: data.packId,
        message: `${data.clearFirst ? `Cleared ${cleared} existing entries. ` : ''}Exported ${toCreate.length} documents from "${folder.name}" to compendium "${pack.metadata.label}"`,
      };
    } catch (error) {
      throw new Error(`Failed to export folder to compendium: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleUpdateFolder(data: {
    folderId: string;
    name?: string;
    parent?: string | null;
  }): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      const folder = (game as any).folders.get(data.folderId);
      if (!folder) {
        throw new Error(`Folder not found: ${data.folderId}`);
      }

      const updates: any = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.parent !== undefined) updates.folder = data.parent;

      await folder.update(updates);
      return {
        id: folder.id,
        name: folder.name,
        type: folder.type,
        parent: folder.folder?.id || null,
      };
    } catch (error) {
      throw new Error(`Failed to update folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===== ADVENTURE IMPORT HANDLERS =====

  /**
   * Handle multi-page journal entry creation
   */
  private async handleCreateJournalEntryMultiPage(data: {
    name: string;
    pages: Array<{
      name: string;
      type: 'text' | 'image';
      content?: string;
      src?: string;
      caption?: string;
    }>;
    folder?: string;
    folderName?: string;
    ownership?: Record<string, number>;
  }): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.name) {
        throw new Error('name is required');
      }
      if (!data.pages || !Array.isArray(data.pages) || data.pages.length === 0) {
        throw new Error('pages array is required and must not be empty');
      }

      // Build pages array for Foundry API
      const pages = data.pages.map((page, index) => {
        const pageData: any = {
          name: page.name,
          type: page.type,
          sort: (index + 1) * 100000, // Ensure proper ordering
        };

        if (page.type === 'text') {
          pageData.text = {
            content: page.content || '',
          };
        } else if (page.type === 'image') {
          pageData.src = page.src || '';
          if (page.caption) {
            pageData.image = { caption: page.caption };
          }
        }

        return pageData;
      });

      // Resolve folder
      let folderId = data.folder || null;
      if (!folderId && data.folderName) {
        // Find or create folder
        const existing = (game as any).folders.find(
          (f: any) => f.type === 'JournalEntry' && f.name === data.folderName
        );
        if (existing) {
          folderId = existing.id;
        } else {
          const newFolder = await (Folder as any).create({
            name: data.folderName,
            type: 'JournalEntry',
          });
          folderId = newFolder.id;
        }
      }

      const journalData: any = {
        name: data.name,
        pages,
        ownership: data.ownership || { default: 0 },
      };
      if (folderId) {
        journalData.folder = folderId;
      }

      const journal = await (JournalEntry as any).create(journalData);

      if (!journal) {
        throw new Error('Failed to create journal entry');
      }

      return {
        id: journal.id,
        name: journal.name,
        pageCount: journal.pages.size,
        pageIds: journal.pages.map((p: any) => ({ id: p.id, name: p.name })),
      };
    } catch (error) {
      throw new Error(`Failed to create journal entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle roll table creation
   */
  private async handleCreateRollTable(data: {
    name: string;
    formula: string;
    description?: string;
    results: Array<{
      range: [number, number];
      text: string;
      type?: number;
      documentCollection?: string;
      documentId?: string;
      img?: string;
      weight?: number;
    }>;
    folder?: string;
    folderName?: string;
    img?: string;
    replacement?: boolean;
    displayRoll?: boolean;
  }): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.name) {
        throw new Error('name is required');
      }
      if (!data.formula) {
        throw new Error('formula is required');
      }
      if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
        throw new Error('results array is required and must not be empty');
      }

      // Build results array for Foundry API
      const results = data.results.map((r) => {
        const resultData: any = {
          range: r.range,
          text: r.text,
          type: r.type ?? 0,
          weight: r.weight ?? 1,
        };

        if (r.documentCollection) {
          resultData.documentCollection = r.documentCollection;
        }
        if (r.documentId) {
          resultData.documentId = r.documentId;
        }
        if (r.img) {
          resultData.img = r.img;
        }

        return resultData;
      });

      // Resolve folder
      let folderId = data.folder || null;
      if (!folderId && data.folderName) {
        const existing = (game as any).folders.find(
          (f: any) => f.type === 'RollTable' && f.name === data.folderName
        );
        if (existing) {
          folderId = existing.id;
        } else {
          const newFolder = await (Folder as any).create({
            name: data.folderName,
            type: 'RollTable',
          });
          folderId = newFolder.id;
        }
      }

      const tableData: any = {
        name: data.name,
        formula: data.formula,
        description: data.description || '',
        results,
        replacement: data.replacement !== false,
        displayRoll: data.displayRoll !== false,
      };
      if (data.img) {
        tableData.img = data.img;
      }
      if (folderId) {
        tableData.folder = folderId;
      }

      const table = await (RollTable as any).create(tableData);

      if (!table) {
        throw new Error('Failed to create roll table');
      }

      return {
        id: table.id,
        name: table.name,
        formula: table.formula,
        resultCount: table.results.size,
      };
    } catch (error) {
      throw new Error(`Failed to create roll table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle file upload to Foundry data directory
   */
  private async handleUploadFile(data: {
    filename: string;
    base64data: string;
    targetPath: string;
  }): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      if (!data.filename || typeof data.filename !== 'string') {
        throw new Error('filename is required and must be a string');
      }
      if (!data.base64data || typeof data.base64data !== 'string') {
        throw new Error('base64data is required and must be a string');
      }
      if (!data.targetPath || typeof data.targetPath !== 'string') {
        throw new Error('targetPath is required and must be a string');
      }

      // Sanitize filename — allow dots, hyphens, underscores, alphanumeric, and spaces
      const safeFilename = data.filename.replace(/[^a-zA-Z0-9_\-\.\s]/g, '_');

      // Determine MIME type from extension
      const ext = safeFilename.split('.').pop()?.toLowerCase() || '';
      const mimeTypes: Record<string, string> = {
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        gif: 'image/gif',
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        ogg: 'audio/ogg',
        flac: 'audio/flac',
        m4a: 'audio/mp4',
        mp4: 'video/mp4',
        webm: 'video/webm',
        pdf: 'application/pdf',
      };

      const mimeType = mimeTypes[ext];
      if (!mimeType) {
        throw new Error(`Unsupported file extension: .${ext}. Supported: ${Object.keys(mimeTypes).join(', ')}`);
      }

      // Convert base64 to Blob
      const byteCharacters = atob(data.base64data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const file = new File([blob], safeFilename, { type: mimeType });

      // Ensure target directory exists
      const targetPath = data.targetPath.replace(/^\/+|\/+$/g, ''); // Trim slashes
      const FilePickerAPI = (globalThis as any).foundry?.applications?.apps?.FilePicker?.implementation || (globalThis as any).FilePicker;

      // Create directory path recursively
      const parts = targetPath.split('/');
      let currentPath = '';
      for (const part of parts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        try {
          await FilePickerAPI.createDirectory('data', currentPath, { bucket: null });
        } catch (dirError: any) {
          // Directory already exists — that's fine
          if (!dirError.message?.includes('EEXIST') && !dirError.message?.includes('already exists')) {
            console.warn(`[${MODULE_ID}] Directory creation warning for "${currentPath}":`, dirError.message);
          }
        }
      }

      // Upload the file
      const response = await FilePickerAPI.upload(
        'data',
        targetPath,
        file,
        {},
        { notify: false }
      );

      return {
        success: true,
        path: response.path,
        filename: safeFilename,
      };
    } catch (error: any) {
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle scene creation from background image
   */
  private async handleCreateScene(data: {
    name: string;
    backgroundImage: string;
    gridSize?: number;
    gridType?: number;
    width?: number;
    height?: number;
    padding?: number;
    globalLight?: boolean;
    globalLightThreshold?: number | null;
    initialViewPosition?: { x: number; y: number; scale?: number };
    folder?: string;
    folderName?: string;
    gridUnits?: string;
    gridDistance?: number;
  }): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.name) {
        throw new Error('name is required');
      }
      if (!data.backgroundImage) {
        throw new Error('backgroundImage is required');
      }

      // If width/height not provided, try to load the image to get dimensions
      let width = data.width;
      let height = data.height;

      if (!width || !height) {
        try {
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Failed to load background image'));
            img.src = data.backgroundImage;
          });
          width = width || img.naturalWidth;
          height = height || img.naturalHeight;
        } catch (imgError) {
          console.warn(`[${MODULE_ID}] Could not auto-detect image dimensions, using defaults`);
          width = width || 4000;
          height = height || 3000;
        }
      }

      // Resolve folder
      let folderId = data.folder || null;
      if (!folderId && data.folderName) {
        const existing = (game as any).folders.find(
          (f: any) => f.type === 'Scene' && f.name === data.folderName
        );
        if (existing) {
          folderId = existing.id;
        } else {
          const newFolder = await (Folder as any).create({
            name: data.folderName,
            type: 'Scene',
          });
          folderId = newFolder.id;
        }
      }

      const gridSize = data.gridSize || 100;
      const sceneData: any = {
        name: data.name,
        background: {
          src: data.backgroundImage,
        },
        width,
        height,
        padding: data.padding ?? 0.25,
        grid: {
          size: gridSize,
          type: data.gridType ?? 1,
          distance: data.gridDistance ?? 5,
          units: data.gridUnits || 'ft',
        },
        environment: {
          globalLight: {
            enabled: data.globalLight !== false,
          },
        },
      };

      if (data.globalLightThreshold !== undefined && data.globalLightThreshold !== null) {
        sceneData.environment.globalLight.darkness = {
          max: data.globalLightThreshold,
        };
      }

      if (data.initialViewPosition) {
        sceneData.initial = {
          x: data.initialViewPosition.x,
          y: data.initialViewPosition.y,
          scale: data.initialViewPosition.scale || 1,
        };
      }

      if (folderId) {
        sceneData.folder = folderId;
      }

      const scene = await (Scene as any).create(sceneData);

      if (!scene) {
        throw new Error('Failed to create scene');
      }

      // Generate thumbnail
      try {
        await scene.createThumbnail();
      } catch (thumbError) {
        console.warn(`[${MODULE_ID}] Could not generate scene thumbnail:`, thumbError);
      }

      return {
        id: scene.id,
        name: scene.name,
        width: scene.width,
        height: scene.height,
        gridSize: scene.grid?.size || gridSize,
      };
    } catch (error) {
      throw new Error(`Failed to create scene: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle placing map pin notes on a scene
   */
  private async handlePlaceNotes(data: {
    sceneId: string;
    notes: Array<{
      x: number;
      y: number;
      entryId: string;
      pageId?: string;
      text: string;
      iconSize?: number;
      iconTint?: string;
    }>;
  }): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.sceneId) {
        throw new Error('sceneId is required');
      }
      if (!data.notes || !Array.isArray(data.notes) || data.notes.length === 0) {
        throw new Error('notes array is required and must not be empty');
      }

      const scene = (game as any).scenes.get(data.sceneId);
      if (!scene) {
        throw new Error(`Scene not found: ${data.sceneId}`);
      }

      const noteDocuments = data.notes.map((note) => {
        const noteData: any = {
          x: note.x,
          y: note.y,
          entryId: note.entryId,
          text: note.text,
          iconSize: note.iconSize || 40,
          textAnchor: 1, // TEXTANCHOR_TYPES.TOP
        };

        if (note.pageId) {
          noteData.pageId = note.pageId;
        }
        if (note.iconTint) {
          noteData.iconTint = note.iconTint;
        }

        return noteData;
      });

      const created = await scene.createEmbeddedDocuments('Note', noteDocuments);

      return {
        count: created.length,
        noteIds: created.map((n: any) => n.id),
      };
    } catch (error) {
      throw new Error(`Failed to place notes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle creating wall segments on a scene
   */
  private async handleCreateWalls(data: {
    sceneId: string;
    walls: Array<{
      c: [number, number, number, number];
      move?: number;
      sense?: number;
      door?: number;
      ds?: number;
      dir?: number;
    }>;
  }): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.sceneId) {
        throw new Error('sceneId is required');
      }
      if (!data.walls || !Array.isArray(data.walls) || data.walls.length === 0) {
        throw new Error('walls array is required and must not be empty');
      }

      const scene = (game as any).scenes.get(data.sceneId);
      if (!scene) {
        throw new Error(`Scene not found: ${data.sceneId}`);
      }

      const wallDocuments = data.walls.map((wall) => ({
        c: wall.c,
        move: wall.move ?? 20,    // 20 = NORMAL (v13 schema)
        sight: wall.sense ?? 20,  // 20 = NORMAL (v13: field renamed from 'sense' to 'sight')
        door: wall.door ?? 0,     // 0 = NONE
        ds: wall.ds ?? 0,         // 0 = CLOSED
        dir: wall.dir ?? 0,       // 0 = BOTH
      }));

      const created = await scene.createEmbeddedDocuments('Wall', wallDocuments);

      return {
        count: created.length,
        wallIds: created.map((w: any) => w.id),
      };
    } catch (error) {
      throw new Error(`Failed to create walls: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle creating ambient lights on a scene
   */
  private async handleCreateLights(data: {
    sceneId: string;
    lights: Array<{
      x: number;
      y: number;
      config?: {
        dim?: number;
        bright?: number;
        color?: string;
        angle?: number;
        animation?: {
          type: string;
          speed?: number;
          intensity?: number;
        };
      };
    }>;
  }): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.sceneId) {
        throw new Error('sceneId is required');
      }
      if (!data.lights || !Array.isArray(data.lights) || data.lights.length === 0) {
        throw new Error('lights array is required and must not be empty');
      }

      const scene = (game as any).scenes.get(data.sceneId);
      if (!scene) {
        throw new Error(`Scene not found: ${data.sceneId}`);
      }

      const lightDocuments = data.lights.map((light) => {
        const config = light.config || {};
        const lightData: any = {
          x: light.x,
          y: light.y,
          config: {
            dim: config.dim ?? 10,
            bright: config.bright ?? 5,
            color: config.color || '#ff9329',
            angle: config.angle ?? 360,
            alpha: 0.5,
          },
        };

        if (config.animation) {
          lightData.config.animation = {
            type: config.animation.type,
            speed: config.animation.speed ?? 5,
            intensity: config.animation.intensity ?? 5,
          };
        }

        return lightData;
      });

      const created = await scene.createEmbeddedDocuments('AmbientLight', lightDocuments);

      return {
        count: created.length,
        lightIds: created.map((l: any) => l.id),
      };
    } catch (error) {
      throw new Error(`Failed to create lights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle creating tokens on a scene from existing world actors
   */
  private async handleCreateTokens(data: {
    sceneId: string;
    tokens: Array<{
      actorId: string;
      x: number;
      y: number;
      name?: string;
      hidden?: boolean;
      elevation?: number;
      disposition?: number;
      actorLink?: boolean;
    }>;
  }): Promise<any> {
    try {
      const gmCheck = this.validateGMAccess();
      if (!gmCheck.allowed) {
        return { error: 'Access denied', success: false };
      }

      this.dataAccess.validateFoundryState();

      if (!data.sceneId) {
        throw new Error('sceneId is required');
      }
      if (!data.tokens || !Array.isArray(data.tokens) || data.tokens.length === 0) {
        throw new Error('tokens array is required and must not be empty');
      }

      const scene = (game as any).scenes.get(data.sceneId);
      if (!scene) {
        throw new Error(`Scene not found: ${data.sceneId}`);
      }

      const tokenDocuments = data.tokens.map((token) => {
        const actor = (game as any).actors.get(token.actorId);
        if (!actor) {
          throw new Error(`Actor not found: ${token.actorId}`);
        }

        const proto = actor.prototypeToken;
        const tokenData: any = {
          actorId: token.actorId,
          name: token.name ?? proto.name,
          x: token.x,
          y: token.y,
          hidden: token.hidden ?? false,
          elevation: token.elevation ?? 0,
          disposition: token.disposition ?? proto.disposition,
          actorLink: token.actorLink ?? false,
          texture: { src: proto.texture.src },
          width: proto.width,
          height: proto.height,
          sight: proto.sight ? { ...proto.sight } : undefined,
          bar1: proto.bar1 ? { ...proto.bar1 } : undefined,
          bar2: proto.bar2 ? { ...proto.bar2 } : undefined,
        };

        return tokenData;
      });

      const created = await scene.createEmbeddedDocuments('Token', tokenDocuments);

      return {
        count: created.length,
        tokenIds: created.map((t: any) => t.id),
      };
    } catch (error) {
      throw new Error(`Failed to create tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle updating an item within a compendium pack
   */
  private async handleUpdateCompendiumEntry(data: {
    packId: string;
    itemId: string;
    updates: Record<string, any>;
  }): Promise<any> {
    if (!(game as any).user?.isGM) {
      throw new Error('Only GM can update compendium entries');
    }

    const pack = (game as any).packs.get(data.packId);
    if (!pack) {
      throw new Error(`Compendium pack not found: ${data.packId}`);
    }

    if (pack.locked) {
      throw new Error(`Compendium pack is locked: ${data.packId}. Unlock it in Foundry first.`);
    }

    try {
      const doc = await pack.getDocument(data.itemId);
      if (!doc) {
        throw new Error(`Document not found: ${data.itemId} in ${data.packId}`);
      }

      await doc.update(data.updates);

      return {
        success: true,
        id: data.itemId,
        name: (doc as any).name,
      };
    } catch (error) {
      throw new Error(`Failed to update compendium entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

}
