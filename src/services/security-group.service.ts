import { createGraphClient } from '../libs/graph-client';
import { SecurityGroupModel } from '../models/security-group.model';
import { SecurityGroupSchema, SecurityGroupDTO } from '../schemas/security-group.schema';
import { generateGroupHash } from '../utils/hash';
import { Logger } from '../utils/logger';

/**
 * Fetch security-enabled groups from Microsoft Graph API.
 * @returns Array of groups with id, displayName, and description
 */
export const fetchSecurityGroupsBySdk = async () => {
  const client = await createGraphClient();

  const groups = await client
    .api('/groups')
    .filter('securityEnabled eq true')
    .get();
  const graphGroups: unknown[] = groups.value;
  const syncedGroups: any[] = [];

  let processed = 0, skipped = 0, errors = 0;

  for (const groupRaw of graphGroups) {
    try {
      const group: SecurityGroupDTO = SecurityGroupSchema.parse(groupRaw);

      const groupHash = generateGroupHash(group);
      const existing = await SecurityGroupModel.findOne({ graphId: group.id });

      if (!existing || existing.groupHash !== groupHash) {
        const groupDocument = await SecurityGroupModel.replaceOne(
          { graphId: group.id },
          {
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
          },
          { upsert: true }
        );

        Logger.info(`[GroupSync] Replaced: ${group.displayName} (${group.id})`);
        syncedGroups.push(groupDocument);
        processed++;
      } else {
        Logger.debug(`[GroupSync] Skipped unchanged group: ${group.displayName}`);
        skipped++;
      }
    } catch (err: any) {
      if (err.name === 'ZodError') {
        Logger.warn(`[GroupSync] Skipping invalid group: ${err.errors.map((e: { message: any; }) => e.message).join(', ')}`);
        skipped++;
      } else {
        Logger.error(`[GroupSync] Error syncing group: ${err.message}`);
        errors++;
      }
    }
  }

  return {
    processed,
    skipped,
    errors,
    groups: syncedGroups
  };
};
