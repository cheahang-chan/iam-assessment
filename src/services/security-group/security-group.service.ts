import { SecurityGroupDTO, SecurityGroupSchema } from '../../schemas/security-group.schema';
import { generateGroupHash } from '../../utils/hash';
import { IGraphClient, IGraphPagedResponse, ISecurityGroupModel, ISyncResult } from './security-group.interfaces';
import { ILogger } from '../../interfaces/logger.interface';
import { AppError, ValidationError } from '../../utils/errors';
import { HttpStatus } from '../../utils/http-status';
import { AppConfig } from '../../config/app.config';
import pLimit from "p-limit";
import { getAccessToken } from '../../libs/graph-client';
import axios from 'axios';

/**
 * Service responsible for synchronizing security-enabled groups from Microsoft Graph API
 * into the local database. Handles fetching, validation, diffing, and upserting group data.
 * 
 * Dependencies are injected for testability and flexibility.
 */
export class SecurityGroupService {
  private graphClient: IGraphClient;
  private groupModel: ISecurityGroupModel;
  private logger: ILogger;

  /**
   * @param graphClient - Abstraction over Microsoft Graph API client
   * @param groupModel - Abstraction over the SecurityGroup database model
   * @param logger - Logger instance for observability
   * 
   * Dev Note: All dependencies are injected to facilitate testing and decoupling.
   */
  constructor(
    graphClient: IGraphClient,
    groupModel: ISecurityGroupModel,
    logger: ILogger
  ) {
    this.graphClient = graphClient;
    this.groupModel = groupModel;
    this.logger = logger;
  }

  /**
   * Sync security-enabled groups from Microsoft Graph API.
   * @param dryRun If true, does not persist changes.
   * 
   * Upsert should be used instead of delete & insert as we want to
   * preserve existing relations, indexes or references if any.
   * 
   * As a side note, using delete & insert is two commands and therefore
   * should be done using a transaction to ensure we don't lose data mid-sync
   * due to any potential failures.
   * 
   * Using replaceOne instead of updateOne allows us to completely replace 
   * the document while also preserving any index definitions.
   * 
   * Hash-based Diff:
   * In order to check whether any content has changed for it to invoke the
   * replace function, we keep a hash (SHA256) of the stored document and
   * compare it with the hash of the incoming document. This allows us to know
   * when any field has been changed and update it in our database and ensure
   * bit-for-bit data fidelity.
   */

  async syncSecurityGroups({ sdk = true, dryRun = false }: { sdk?: boolean, dryRun?: boolean }): Promise<ISyncResult> {
    const { pages, groups } = sdk ? await this.fetchGroupsBySdk() : await this.fetchGroupsByApi();
    console.log("SDK", sdk);

    const response: ISyncResult = {
      processed: 0,
      skipped: 0,
      errors: 0,
      pages: pages,
      groups: []
    }

    const limit = pLimit(AppConfig.CONCURRENCY_LIMIT);

    const tasks = groups.map(groupRaw =>
      limit(async () => {
        try {
          const group = this.validateGroup(groupRaw);
          const groupHash = generateGroupHash(group);
          const existing = await this.groupModel.findOne({ graphId: group.id });

          if (!existing || existing.groupHash !== groupHash) {
            const document = {
              graphId: group.id,
              displayName: group.displayName,
              description: group.description || '',
              mailNickname: group.mailNickname || '',
              mailEnabled: group.mailEnabled,
              securityEnabled: group.securityEnabled,
              groupTypes: group.groupTypes || [],
              visibility: group.visibility || '',
              createdDateTime: new Date(group.createdDateTime),
              renewedDateTime: new Date(group.renewedDateTime),
              syncedAt: new Date(),
              groupHash
            };

            if (!dryRun) {
              await this.groupModel.replaceOne(
                { graphId: group.id },
                document,
                { upsert: true }
              );

              this.logger.info(`[GroupSync] Replaced: ${group.displayName} (${group.id})`);
            } else {
              this.logger.info(`[GroupSync] Would replace: ${group.displayName} (${group.id})`);
            }

            response.groups.push(document);
            response.processed++;
          } else {
            this.logger.debug(`[GroupSync] Skipped unchanged group: ${group.displayName}`);
            response.skipped++;
          }
        } catch (err: any) {
          if (err.name === 'ZodError') {
            this.logger.warn(`[GroupSync] Skipping invalid group: ${err.errors?.map((e: { message: any }) => e.message).join(', ')}`);
            response.skipped++;
          } else {
            this.logger.error(`[GroupSync] Error syncing group: ${err.message}`);
            response.errors++;
          }
        }
      })
    );

    await Promise.allSettled(tasks);

    return response;
  }

  /**
   * Get all security groups from the database.
   */
  async getAllSecurityGroups() {
    return this.groupModel.find({});
  }

  /**
   * Get a security group by its MongoDB _id.
   * @param id MongoDB ObjectId string
   */
  async getSecurityGroupById(id: string) {
    return this.groupModel.findOne({ graphId: id });
  }

  /**
   * Delete all security groups from the database.
   */
  async deleteAllSecurityGroups() {
    return this.groupModel.deleteMany({});
  }

  /**
   * Delete a security group by its MongoDB _id.
   * @param id MongoDB ObjectId string
   */
  async deleteSecurityGroupById(id: string) {
    return this.groupModel.findOneAndDelete({ graphId: id });
  }

  /**
   * Fetches all security-enabled groups from Microsoft Graph API, handling pagination.
   * Aggregates results from all pages.
   * The filter ensures only security-enabled groups are returned.
   * 
   * Future Improvements:
   * Use a circuit-breaker & retry policy for more advanced error handling and resilience.
   * We can also think about caching results from Graph API, but that maybe redundant as
   * syncing to MongoDB is in a way a form of caching mechanism.
   */
  private async fetchGroupsBySdk(): Promise<{ pages: number, groups: unknown[] }> {
    try {
      let request = this.graphClient
        .api('/groups')
        .filter('securityEnabled eq true')
        .top(AppConfig.EXTERNAL.AZURE.GRAPH_TOP_LIMIT);

      let result = (await request.get()) as IGraphPagedResponse;
      let groups = result.value || [];
      let pages = 1;

      // Handle pagination using @odata.nextLink
      while (result['@odata.nextLink']) {
        result = (await this.graphClient.api(result['@odata.nextLink'] as string).get()) as IGraphPagedResponse;
        groups = groups.concat(result.value || []);
        pages++;
      }

      return { pages, groups };
    } catch (err: any) {
      throw new AppError(
        'Failed to fetch security groups from Microsoft Graph API',
        HttpStatus.BAD_GATEWAY,
        'GRAPH_API_ERROR',
        err);
    }
  }

  private async fetchGroupsByApi(): Promise<{ pages: number; groups: unknown[] }> {
    const groups: unknown[] = [];
    let pages = 0;

    try {
      const accessToken = await getAccessToken();
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      };

      let url = `https://graph.microsoft.com/v1.0/groups?$filter=securityEnabled eq true&$top=${AppConfig.EXTERNAL.AZURE.GRAPH_TOP_LIMIT}`;

      while (url) {
        const response = await axios.get<IGraphPagedResponse>(url, { headers });

        groups.push(...(response.data.value || []));
        url = response.data['@odata.nextLink'] || '';
        pages++;
      }

      return { pages, groups };
    } catch (err: any) {
      throw new AppError(
        'Failed to fetch security groups from Microsoft Graph API',
        HttpStatus.BAD_GATEWAY,
        'GRAPH_API_ERROR',
        err
      );
    }
  }

  /**
   * Validates and parses a raw group object using Zod schema.
   * 
   * Throws ValidationError if the input does not conform to the schema.
   * This ensures only well-formed data is processed and persisted.
   */
  private validateGroup(groupRaw: unknown): SecurityGroupDTO {
    try {
      return SecurityGroupSchema.parse(groupRaw);
    } catch (err: any) {
      throw new ValidationError('Invalid security group data', err.errors);
    }
  }
}
