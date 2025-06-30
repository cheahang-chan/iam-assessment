import 'dotenv/config';
import { createGraphClient } from '../libs/graph-client';
import { Logger } from '../utils/logger';

const seedSecurityGroups = async () => {
    // https://portal.azure.com/?feature.msaljs=true#view/Microsoft_AAD_IAM/GroupsList.ReactView

    const client = await createGraphClient();

    // Generate 25 groups for pagination testing
    const groups = Array.from({ length: 25 }, (_, i) => ({
        name: `Test Group ${i + 1}`,
        nickname: `test-group-${i + 1}`
    }));

    for (const g of groups) {
        await client.api('/groups').post({
            displayName: g.name,
            mailEnabled: false,
            mailNickname: g.nickname,
            securityEnabled: true
        });
        Logger.info(`Created group: ${g.name}`);
    }
};

seedSecurityGroups().catch(Logger.error);
