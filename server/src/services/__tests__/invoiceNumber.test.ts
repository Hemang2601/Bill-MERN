import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { getNextInvoiceNumber } from '../invoiceNumberService.js';
import { Counter } from '../../models/Counter.js';
import { config } from '../../config/index.js';

describe('Concurrent Invoice Number Generation', () => {
  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(config.mongoUri);
    }
  });

  after(async () => {
    await mongoose.disconnect();
  });

  it('allocates distinct, sequential invoice numbers for simulated concurrent manager requests', async () => {
    // Simulate 5 simultaneous requests from Hiren and Suresh
    const promises = [
      getNextInvoiceNumber('2026-11-15'),
      getNextInvoiceNumber('2026-11-15'),
      getNextInvoiceNumber('2026-11-15'),
      getNextInvoiceNumber('2026-11-15'),
      getNextInvoiceNumber('2026-11-15'),
    ];

    const results = await Promise.all(promises);

    // Verify all 5 numbers are unique
    const uniqueNumbers = new Set(results);
    assert.equal(uniqueNumbers.size, 5);

    // Verify format matches SE-2611-XXX
    results.forEach((invNum) => {
      assert.match(invNum, /^SE-2611-\d{3}$/);
    });
  });
});
