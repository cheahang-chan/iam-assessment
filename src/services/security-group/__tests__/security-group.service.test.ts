import { ILogger } from '../../../interfaces/logger.interface';
import { SecurityGroupService } from '../security-group.service';
import { IGraphClient, ISecurityGroupModel, ISyncResult } from '../security-group.interfaces';

const mockGraphClient: IGraphClient = {
    api: () => ({
        filter: () => ({
            get: async () => ({
                value: [
                    {
                        id: '598b1e6f-cd57-4949-9652-70498bc17fe7',
                        displayName: 'Test Group',
                        description: 'A test group',
                        mailNickname: 'testgroup',
                        mailEnabled: false,
                        securityEnabled: true,
                        groupTypes: [],
                        visibility: 'Private',
                        createdDateTime: "2025-06-22T14:00:00.000Z",
                        renewedDateTime: "2025-06-22T14:00:00.000Z",
                    }
                ]
            })
        })
    })
};

const mockModel: ISecurityGroupModel = {
    findOne: async () => null,
    replaceOne: async () => ({ graphId: '1', displayName: 'Test Group' }),
};

const mockLogger: ILogger = {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

describe('SecurityGroupService', () => {
    it('should process and upsert new groups', async () => {
        const service = new SecurityGroupService(mockGraphClient, mockModel, mockLogger);
        const result: ISyncResult = await service.syncSecurityGroups({ dryRun: false });

        expect(result.processed).toBe(1);
        expect(result.skipped).toBe(0);
        expect(result.errors).toBe(0);
        expect(result.groups.length).toBe(1);
    });

    it('should skip unchanged groups', async () => {
        const modelWithExisting: ISecurityGroupModel = {
            findOne: async () => ({
                id: '598b1e6f-cd57-4949-9652-70498bc17fe7',
                displayName: 'Test Group',
                description: 'A test group',
                mailNickname: 'testgroup',
                mailEnabled: false,
                securityEnabled: true,
                groupTypes: [],
                visibility: 'Private',
                createdDateTime: "2025-06-22T14:00:00.000Z",
                renewedDateTime: "2025-06-22T14:00:00.000Z",
                groupHash: 'fb49aae60b360dd72c7cf2601bcfb2c676019049766f75bdebb7f2fee04306d2'
            }),
            replaceOne: async () => ({}),
        };

        const service = new SecurityGroupService(mockGraphClient, modelWithExisting, mockLogger);
        const result: ISyncResult = await service.syncSecurityGroups({ dryRun: false });

        expect(result.processed).toBe(0);
        expect(result.skipped).toBe(1);
        expect(result.errors).toBe(0);
        expect(result.groups.length).toBe(0);
    });
});
