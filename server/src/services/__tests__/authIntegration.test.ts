import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';

import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../server.js';
import { config } from '../../config/index.js';

describe('Authentication & API Access Control', () => {
  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.mongoUri);
    }
  });

  after(async () => {
    await mongoose.disconnect();
    setTimeout(() => process.exit(0), 100);
  });

  it('rejects unauthorized access to protected dashboard endpoints', async () => {
    const res = await request(app).get('/api/v1/dashboard/summary');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('rejects invalid manager login credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'hiren', password: 'wrongpassword' });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('rejects arbitrary unauthorized manager accounts', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'password123' });

    assert.equal(res.status, 400); // Zod rejects non hiren/suresh enum
  });

  it('successfully authenticates authorized manager Suresh with PIN 1975', async () => {
    const agent = request.agent(app);
    const loginRes = await agent
      .post('/api/v1/auth/login')
      .send({ username: 'suresh', password: '1975' });

    assert.equal(loginRes.status, 200);
    assert.equal(loginRes.body.success, true);
    assert.equal(loginRes.body.data.username, 'suresh');
    assert.equal(loginRes.body.data.displayName, 'Suresh');

    // With authenticated session cookie, access protected /me
    const meRes = await agent.get('/api/v1/auth/me');
    assert.equal(meRes.status, 200);
    assert.equal(meRes.body.data.username, 'suresh');

    // Access protected dashboard summary
    const dashRes = await agent.get('/api/v1/dashboard/summary');
    assert.equal(dashRes.status, 200);
    assert.equal(dashRes.body.success, true);
    assert(dashRes.body.data.kpis !== undefined);
  });

  it('successfully authenticates authorized manager Hiren with PIN 3112', async () => {
    const agent = request.agent(app);
    const loginRes = await agent
      .post('/api/v1/auth/login')
      .send({ username: 'hiren', password: '3112' });

    assert.equal(loginRes.status, 200);
    assert.equal(loginRes.body.success, true);
    assert.equal(loginRes.body.data.username, 'hiren');
    assert.equal(loginRes.body.data.displayName, 'Hiren');
  });
});
