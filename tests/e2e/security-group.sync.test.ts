import request from 'supertest';
import app from '../../src/app';

jest.mock('../../src/libs/graph-client', () => ({
  createGraphClient: async () => ({
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
  }),
}));

describe('E2E [POST] - /api/v1/security-groups/sync', () => {
  it('should respond with status code 200 and expected structure', async () => {
    const response = await request(app)
      .post('/api/v1/security-groups/sync')
      .query({ dryRun: 'true' })
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', true);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('processed');
    expect(response.body.data).toHaveProperty('skipped');
    expect(response.body.data).toHaveProperty('errors');
    expect(response.body.data).toHaveProperty('groups');
    expect(Array.isArray(response.body.data.groups)).toBe(true);
  }, 20000); // 20s timeout
});
