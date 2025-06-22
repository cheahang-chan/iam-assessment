import { SecurityGroupDTO, SecurityGroupSchema } from '../../schemas/security-group.schema';
import { generateGroupHash } from '../../utils/hash';
import { IGraphClient, ISecurityGroupModel, ISyncResult } from './security-group.interfaces';
import { ILogger } from '../../interfaces/logger.interface';
import { AppError, ValidationError } from '../../utils/errors';

export class SecurityGroupService {
  private graphClient: IGraphClient;
  private groupModel: ISecurityGroupModel;
  private logger: ILogger;

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
   * 
   * Dev Notes:
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

  async syncSecurityGroups({ dryRun = false }: { dryRun?: boolean }): Promise<ISyncResult> {
    const groups = await this.fetchGroups();

    const response: ISyncResult = {
      processed: 0,
      skipped: 0,
      errors: 0,
      groups: []
    }

    for (const groupRaw of groups) {
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
    }

    return response;
  }

  private async fetchGroups(): Promise<unknown[]> {
    try {
      const result = await this.graphClient
        .api('/groups')
        .filter('securityEnabled eq true')
        .get();
      return result.value;
    } catch (err: any) {
      throw new AppError('Failed to fetch security groups from Microsoft Graph API', 502, 'GRAPH_API_ERROR', err);
    }
  }

  private validateGroup(groupRaw: unknown): SecurityGroupDTO {
    try {
      return SecurityGroupSchema.parse(groupRaw);
    } catch (err: any) {
      throw new ValidationError('Invalid security group data', err.errors);
    }
  }
}
