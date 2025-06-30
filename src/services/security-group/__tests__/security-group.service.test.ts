import { ILogger } from '../../../interfaces/logger.interface';
import { SecurityGroupService } from '../security-group.service';
import { IGraphClient, IGraphRequest, ISecurityGroupModel, ISyncResult } from '../security-group.interfaces';

function createMockGraphRequest(data: any): IGraphRequest {
    return {
        filter: function (query: string) { return this; },
        top: function (n: number) { return this; },
        select: function (fields: string) { return this; },
        get: async function () { return data; }
    };
}

export const mockGraphClient: IGraphClient = {
  api: (_path: string): IGraphRequest => ({
    filter: function (_query: string) {
      return this;
    },
    top: function (_n: number) {
      return this;
    },
    select: function (_fields: string) {
      return this;
    },
    get: async function () {
      return {
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
            createdDateTime: '2025-06-22T14:00:00.000Z',
            renewedDateTime: '2025-06-22T14:00:00.000Z',
          },
        ],
      };
    },
  }),
};

const mockPaginationGraphClient: IGraphClient = {
    api: (path: string) => {
        if (path === '/groups') {
            return createMockGraphRequest({
                value: [
                    {
                        id: '598b1e6f-cd57-4949-9652-70498bc17fe7',
                        displayName: 'Group 1',
                        description: 'First group',
                        mailNickname: 'group1',
                        mailEnabled: false,
                        securityEnabled: true,
                        groupTypes: [],
                        visibility: 'Private',
                        createdDateTime: "2025-06-22T14:00:00.000Z",
                        renewedDateTime: "2025-06-22T14:00:00.000Z",
                    }
                ],
                '@odata.nextLink': 'next-page-link'
            });
        } else if (path === 'next-page-link') {
            return createMockGraphRequest({
                value: [
                    {
                        id: '4e5b3e23-c16b-4565-8e60-bbe0ef526a63',
                        displayName: 'Group 2',
                        description: 'Second group',
                        mailNickname: 'group2',
                        mailEnabled: false,
                        securityEnabled: true,
                        groupTypes: [],
                        visibility: 'Private',
                        createdDateTime: "2025-06-23T14:00:00.000Z",
                        renewedDateTime: "2025-06-23T14:00:00.000Z",
                    }
                ]
            });
        }
        return createMockGraphRequest({ value: [] });
    }
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

    it('should aggregate groups from paginated Graph API responses', async () => {
        const service = new SecurityGroupService(mockPaginationGraphClient, mockModel, mockLogger);
        const result: ISyncResult = await service.syncSecurityGroups({ dryRun: false });

        expect(result.processed).toBe(2);
        expect(result.skipped).toBe(0);
        expect(result.errors).toBe(0);
        expect(result.groups.length).toBe(2);
        expect(result.groups[0].graphId).toBe('598b1e6f-cd57-4949-9652-70498bc17fe7');
        expect(result.groups[1].graphId).toBe('4e5b3e23-c16b-4565-8e60-bbe0ef526a63');
    });
});
