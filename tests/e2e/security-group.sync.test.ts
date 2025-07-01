import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import createApp from '../../src/app';
import { HttpStatus } from '../../src/utils/http-status';

// Mock Microsoft Graph Client with method chaining
jest.mock('../../src/libs/graph-client', () => ({
  createGraphClient: async () => ({
    api: (_path: string) => ({
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
  }),
}));

let mongoServer: MongoMemoryServer;
let app: any;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGO_URI = uri;
  await mongoose.connect(uri);
  app = await createApp();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('E2E [POST] - /api/v1/security-groups/sync', () => {
  it('should respond with status code 200 and expected structure', async () => {
    const response = await request(app)
      .post('/api/v1/security-groups/sync')
      .query({ dryRun: 'true' })
      .send();

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toMatchObject({
      status: true,
      message: expect.any(String),
      data: {
        processed: expect.any(Number),
        skipped: expect.any(Number),
        errors: expect.any(Number),
        groups: expect.any(Array),
      },
    });
  }, 20000); // 20s timeout
});