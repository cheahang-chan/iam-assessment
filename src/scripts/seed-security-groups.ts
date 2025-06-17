import 'dotenv/config';
import { createGraphClient } from '../libs/graph-client';
import { Logger } from '../utils/logger';

const seedSecurityGroups = async () => {
    // https://portal.azure.com/?feature.msaljs=true#view/Microsoft_AAD_IAM/GroupsList.ReactView

    const client = await createGraphClient();

    const groups = [
        { name: 'DevOps Team', nickname: 'devops-team' },
        { name: 'Finance Team', nickname: 'finance-team' },
        { name: 'QA Group', nickname: 'qa-group' }
    ];

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
