import 'dotenv/config';
import { createGraphClient } from '../libs/graph-client';

const seedSecurityGroups = async () => {
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
        console.log(`Created group: ${g.name}`);
    }
};

seedSecurityGroups().catch(console.error);
