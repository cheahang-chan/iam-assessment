import { createGraphClient } from '../libs/graph-client';

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

  return groups.value;
};
