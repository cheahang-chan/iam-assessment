import { createGraphClient } from '../../libs/graph-client';
import { SecurityGroupModel } from '../../models/security-group.model';
import { Logger } from '../../utils/logger';
import { SecurityGroupService } from './security-group.service';

export async function createSecurityGroupService(): Promise<SecurityGroupService> {
    const graphClient = await createGraphClient();
    return new SecurityGroupService(
        graphClient,
        SecurityGroupModel,
        Logger
    );
}