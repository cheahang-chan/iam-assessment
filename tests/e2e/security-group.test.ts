
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import createApp from '../../src/app';
import { SecurityGroupModel } from '../../src/models/security-group.model';
import { randomUUID } from 'crypto';
import { HttpStatus } from '../../src/utils/http-status';

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

describe('E2E [GET/DELETE] - /api/v1/security-groups', () => {
  let testGroup: any;

  beforeEach(async () => {
    // Insert a test security group
    testGroup = await SecurityGroupModel.create({
      graphId: '19af71aa-38c8-4ccb-90b1-aa40b0d6470e',
      displayName: 'Test Group',
      description: 'A test group',
      mailNickname: 'testgroup',
      mailEnabled: false,
      securityEnabled: true,
      groupTypes: [],
      visibility: 'Private',
      createdDateTime: new Date(),
      renewedDateTime: new Date(),
      groupHash: 'hash123',
      syncedAt: new Date(),
    });
  });

  afterEach(async () => {
    await SecurityGroupModel.deleteMany({});
  });

  it('should get all security groups [GET /api/v1/security-groups/]', async () => {
    const res = await request(app).get('/api/v1/security-groups');
    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.status).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0]).toMatchObject({
      graphId: testGroup.graphId,
      displayName: testGroup.displayName,
    });
  });

  it('should get a security group by id [GET /api/v1/security-groups/:id]', async () => {
    const res = await request(app).get(`/api/v1/security-groups/${testGroup.graphId}`);
    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.status).toBe(true);
    expect(res.body.data).toMatchObject({
      graphId: testGroup.graphId,
      displayName: testGroup.displayName,
    });
  });

  it('should return 404 for non-existent group [GET /api/v1/security-groups/:id]', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/v1/security-groups/${fakeId}`);
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
    expect(res.body.status).toBe(false);
    expect(res.body.data.traceId).toBeDefined();
    expect(res.body.data.code).toBe("NOT_FOUND_ERROR");
  });

  it('should delete all security groups [DELETE /api/v1/security-groups/]', async () => {
    const res = await request(app).delete('/api/v1/security-groups/');
    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.status).toBe(true);

    // Verify all groups deleted
    const groups = await SecurityGroupModel.find();
    expect(groups.length).toBe(0);
  });

  it('should delete a security group by id [DELETE /api/v1/security-groups/:id]', async () => {
    const res = await request(app).delete(`/api/v1/security-groups/${testGroup.graphId}`);
    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.status).toBe(true);

    // Verify group deleted
    const group = await SecurityGroupModel.findOne({ graphId: testGroup.graphId });
    expect(group).toBeNull();
  });

  it('should return 404 when deleting non-existent group [DELETE /api/v1/security-groups/:id]', async () => {
    const nonExistentId = randomUUID();
    const res = await request(app).delete(`/api/v1/security-groups/${nonExistentId}`);
    expect(res.status).toBe(HttpStatus.NOT_FOUND);
    expect(res.body.status).toBe(false);
    expect(res.body.data.traceId).toBeDefined();
    expect(res.body.data.code).toBe("NOT_FOUND_ERROR");
  });
});
