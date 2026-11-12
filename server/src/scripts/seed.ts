import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';
import { Manager } from '../models/Manager.js';
import { BusinessSettings } from '../models/BusinessSettings.js';
import { Product } from '../models/Product.js';
import { Customer } from '../models/Customer.js';
import { Invoice } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';
import { Counter } from '../models/Counter.js';
import { calculateInvoice } from '../services/calculationService.js';
import { logger } from '../utils/logger.js';

async function seed() {
  logger.info('Connecting to MongoDB for database initialization...');
  await mongoose.connect(config.mongoUri);

  logger.info('--- STEP 1: INITIALIZING AUTHORIZED MANAGERS ---');
  // Manager 1: Hiren
  const hirenPassword = config.hirenInitialPassword;
  const hirenHash = await bcrypt.hash(hirenPassword, 10);
  await Manager.findOneAndUpdate(
    { username: 'hiren' },
    {
      username: 'hiren',
      displayName: 'Hiren',
      passwordHash: hirenHash,
      signatureImage: 'hiren.png',
      role: 'manager',
      phone: '+91 90336 60384',
      email: 'hiren@shreeshaktielectric.com',
      isActive: true,
    },
    { upsert: true, new: true }
  );

  // Manager 2: Suresh
  const sureshPassword = config.sureshInitialPassword;
  const sureshHash = await bcrypt.hash(sureshPassword, 10);
  await Manager.findOneAndUpdate(
    { username: 'suresh' },
    {
      username: 'suresh',
      displayName: 'Suresh',
      passwordHash: sureshHash,
      signatureImage: 'suresh.png',
      role: 'manager',
      phone: '+91 70160 55176',
      email: 'suresh@shreeshaktielectric.com',
      isActive: true,
    },
    { upsert: true, new: true }
  );
  logger.info('✔ Initialized exactly two authorized managers: Hiren and Suresh');

  logger.info('--- STEP 2: INITIALIZING BUSINESS SETTINGS ---');
  await BusinessSettings.findOneAndUpdate(
    {},
    {
      businessName: 'SHREE SHAKTI ELECTRIC',
      tagline: 'Specialist in: All types of Electric Fitting, Wiring & Maintenance',
      specialization: 'All types of Electric Fitting, Wiring & Maintenance',
      phone1: '+91 90336 60384',
      phone2: '+91 70160 55176',
      email: 'shreeshaktielectric@gmail.com',
      address: 'Shop No. 4, Shreeji Complex, Near Maruti Mandir, Main Bazar',
      city: 'Rajkot',
      state: 'Gujarat',
      stateCode: '24',
      pinCode: '360001',
      gstin: '24AAAPS1234F1Z5',
      pan: 'AAAPS1234F',
      bankName: 'State Bank of India',
      accountNumber: '38290192831',
      ifscCode: 'SBIN0001234',
      branch: 'Rajkot Main Branch',
      upiId: '9033660384@sbi',
      invoicePrefix: 'SE',
      invoiceTerms: [
        'E & O.E',
        '1. Goods once sold will not be taken back.',
        '2. Guarantee / warranty as per manufacturer policy.',
        '3. Subject to local jurisdiction only.',
      ],
      defaultNotes: 'Thank you for choosing Shree Shakti Electric! We appreciate your business.',
      isGstEnabled: true,
      defaultGstRate: 18,
    },
    { upsert: true, new: true }
  );
  logger.info('✔ Business settings initialized');

  logger.info('--- STEP 3: INITIALIZING ELECTRICAL PRODUCT CATALOG ---');
  const defaultProducts = [
    {
      name: 'Switch 6A 1-Way Modular',
      sku: 'SW-6A-MOD',
      description: 'Anchor Roma / Roma Classic 6A 1-Way Modular Switch White',
      category: 'Switches & Sockets',
      unit: 'Nos',
      sellingPrice: 45.0,
      purchasePrice: 28.0,
      taxRate: 18,
      hsn: '8536',
    },
    {
      name: 'Socket 6A 3-Pin Modular',
      sku: 'SKT-6A-MOD',
      description: 'Anchor Roma 6A 3-Pin Shuttered Socket',
      category: 'Switches & Sockets',
      unit: 'Nos',
      sellingPrice: 85.0,
      purchasePrice: 55.0,
      taxRate: 18,
      hsn: '8536',
    },
    {
      name: 'Power Socket 16A Modular',
      sku: 'SKT-16A-MOD',
      description: 'Heavy duty 16A 3-Pin Shuttered Power Socket',
      category: 'Switches & Sockets',
      unit: 'Nos',
      sellingPrice: 145.0,
      purchasePrice: 95.0,
      taxRate: 18,
      hsn: '8536',
    },
    {
      name: 'LED Bulb 9W Cool Daylight (B22)',
      sku: 'LED-9W-B22',
      description: 'Philips / Havells 9W Cool Day Light LED Bulb B22 Base',
      category: 'Lighting',
      unit: 'Nos',
      sellingPrice: 110.0,
      purchasePrice: 72.0,
      taxRate: 12,
      hsn: '8539',
    },
    {
      name: 'LED Batten 20W 4ft Tube Light',
      sku: 'LED-BAT-20W',
      description: 'Crompton 20W High Lumen Slim LED Batten',
      category: 'Lighting',
      unit: 'Nos',
      sellingPrice: 280.0,
      purchasePrice: 185.0,
      taxRate: 12,
      hsn: '8539',
    },
    {
      name: '1.5mm FR PVC Copper Wire Coil (90m)',
      sku: 'WIRE-1.5-FR',
      description: 'Polycab / RR Kabel 1.5 sq mm Flame Retardant Wire 90m Coil',
      category: 'Wires & Cables',
      unit: 'Coil',
      sellingPrice: 1850.0,
      purchasePrice: 1450.0,
      taxRate: 18,
      hsn: '8544',
    },
    {
      name: '2.5mm FR PVC Copper Wire Coil (90m)',
      sku: 'WIRE-2.5-FR',
      description: 'Polycab 2.5 sq mm Flame Retardant Wire 90m Coil Red/Black',
      category: 'Wires & Cables',
      unit: 'Coil',
      sellingPrice: 2950.0,
      purchasePrice: 2350.0,
      taxRate: 18,
      hsn: '8544',
    },
    {
      name: 'Fan Regulator 5-Step Modular',
      sku: 'REG-5STEP',
      description: 'Hum-free 5-Step electronic fan speed controller',
      category: 'Switches & Sockets',
      unit: 'Nos',
      sellingPrice: 220.0,
      purchasePrice: 140.0,
      taxRate: 18,
      hsn: '8414',
    },
    {
      name: 'MCB 16A Single Pole C-Curve',
      sku: 'MCB-16A-SP',
      description: 'Schneider / L&T 16A SP Mini Circuit Breaker 10kA',
      category: 'Protection Devices',
      unit: 'Nos',
      sellingPrice: 190.0,
      purchasePrice: 125.0,
      taxRate: 18,
      hsn: '8536',
    },
    {
      name: 'Modular Surface Board 8-Module',
      sku: 'BOX-8MOD',
      description: 'Concealed/Surface PVC box with white grid plate',
      category: 'Boxes & Enclosures',
      unit: 'Nos',
      sellingPrice: 160.0,
      purchasePrice: 98.0,
      taxRate: 18,
      hsn: '8538',
    },
  ];

  for (const prod of defaultProducts) {
    await Product.findOneAndUpdate({ sku: prod.sku }, prod, { upsert: true });
  }
  logger.info(`✔ Catalog seeded with ${defaultProducts.length} electrical products`);

  logger.info('--- STEP 4: INITIALIZING SAMPLE CUSTOMERS ---');
  const defaultCustomers = [
    {
      name: 'Patel Enterprises',
      mobile: '+91 98250 12345',
      email: 'contact@patelenterprises.com',
      billingAddress: 'Plot 42, GIDC Industrial Estate',
      city: 'Rajkot',
      state: 'Gujarat',
      pinCode: '360002',
      gstin: '24AABCP5678Q1Z2',
      notes: 'Regular industrial electrical client',
    },
    {
      name: 'Sharma Electrical Services',
      mobile: '+91 97123 45678',
      email: 'sharma.electric@yahoo.com',
      billingAddress: 'Near Trikon Baug, Palace Road',
      city: 'Rajkot',
      state: 'Gujarat',
      pinCode: '360001',
      gstin: '24AAAPS9988D1Z8',
      notes: 'Sub-contractor for domestic wiring works',
    },
    {
      name: 'Rajeshbhai Mehta',
      mobile: '+91 94280 98765',
      billingAddress: 'A-102, Shivalik Residency, Kalawad Road',
      city: 'Rajkot',
      state: 'Gujarat',
      pinCode: '360005',
      notes: 'Residential renovation customer',
    },
    {
      name: 'Sunrise Builders & Developers',
      mobile: '+91 99099 88776',
      email: 'procurement@sunrisebuilders.in',
      billingAddress: '7th Floor, Imperial Heights, 150ft Ring Road',
      city: 'Rajkot',
      state: 'Gujarat',
      pinCode: '360007',
      gstin: '24AABCS4455F1ZX',
      notes: 'Commercial site bulk purchaser',
    },
  ];

  const createdCustomers: any[] = [];
  for (const cust of defaultCustomers) {
    const c = await Customer.findOneAndUpdate({ mobile: cust.mobile }, cust, {
      upsert: true,
      new: true,
    });
    createdCustomers.push(c);
  }
  logger.info(`✔ Seeded ${createdCustomers.length} initial customers`);

  logger.info('--- STEP 5: INITIALIZING SAMPLE INVOICES ---');
  const existingInvoicesCount = await Invoice.countDocuments();
  if (existingInvoicesCount === 0) {
    const managerHiren = await Manager.findOne({ username: 'hiren' });
    const managerSuresh = await Manager.findOne({ username: 'suresh' });

    const cust1 = createdCustomers[0];
    const cust2 = createdCustomers[1];
    const cust3 = createdCustomers[2];

    const todayStr = new Date().toISOString().slice(0, 10);
    const date1 = '2026-11-05';
    const date2 = '2026-11-08';
    const date3 = todayStr;

    // Invoice 1
    const rawItems1 = [
      {
        name: '1.5mm FR PVC Copper Wire Coil (90m)',
        hsn: '8544',
        quantity: 4,
        unit: 'Coil',
        rate: 1850.0,
        gstRate: 18,
      },
      {
        name: 'Switch 6A 1-Way Modular',
        hsn: '8536',
        quantity: 20,
        unit: 'Nos',
        rate: 45.0,
        gstRate: 18,
      },
      {
        name: 'Socket 6A 3-Pin Modular',
        hsn: '8536',
        quantity: 10,
        unit: 'Nos',
        rate: 85.0,
        gstRate: 18,
      },
    ];
    const calc1 = calculateInvoice(rawItems1, false, true, 5000);
    const inv1 = await Invoice.create({
      invoiceNumber: 'SE-2611-001',
      date: date1,
      dueDate: '2026-11-20',
      placeOfSupply: 'Gujarat (24)',
      isInterState: false,
      customer: {
        customerId: cust1._id,
        name: cust1.name,
        mobile: cust1.mobile,
        email: cust1.email,
        billingAddress: cust1.billingAddress,
        city: cust1.city,
        state: cust1.state,
        pinCode: cust1.pinCode,
        gstin: cust1.gstin,
      },
      items: calc1.items,
      subtotal: calc1.subtotal,
      totalDiscount: calc1.totalDiscount,
      taxableAmount: calc1.taxableAmount,
      totalCgst: calc1.totalCgst,
      totalSgst: calc1.totalSgst,
      totalIgst: calc1.totalIgst,
      totalTax: calc1.totalTax,
      roundOff: calc1.roundOff,
      grandTotal: calc1.grandTotal,
      amountPaid: 5000,
      balanceDue: calc1.balanceDue,
      paymentStatus: calc1.paymentStatus,
      managerId: managerHiren?._id,
      managerUsername: 'hiren',
      managerName: 'Hiren',
      managerSignature: 'hiren.png',
    });

    await Payment.create({
      invoiceId: inv1._id,
      invoiceNumber: inv1.invoiceNumber,
      customerId: cust1._id,
      customerName: cust1.name,
      amount: 5000,
      paymentMethod: 'BANK_TRANSFER',
      referenceNumber: 'NEFT92830192',
      paymentDate: date1,
      notes: 'Advance transfer for industrial wiring supplies',
      recordedBy: {
        id: managerHiren?._id,
        username: 'hiren',
        displayName: 'Hiren',
      },
    });

    // Invoice 2
    const rawItems2 = [
      {
        name: 'LED Batten 20W 4ft Tube Light',
        hsn: '8539',
        quantity: 12,
        unit: 'Nos',
        rate: 280.0,
        gstRate: 12,
      },
      {
        name: 'LED Bulb 9W Cool Daylight (B22)',
        hsn: '8539',
        quantity: 24,
        unit: 'Nos',
        rate: 110.0,
        gstRate: 12,
      },
    ];
    const calc2 = calculateInvoice(rawItems2, false, true, 6720);
    const inv2 = await Invoice.create({
      invoiceNumber: 'SE-2611-002',
      date: date2,
      placeOfSupply: 'Gujarat (24)',
      isInterState: false,
      customer: {
        customerId: cust2._id,
        name: cust2.name,
        mobile: cust2.mobile,
        email: cust2.email,
        billingAddress: cust2.billingAddress,
        city: cust2.city,
        state: cust2.state,
        pinCode: cust2.pinCode,
        gstin: cust2.gstin,
      },
      items: calc2.items,
      subtotal: calc2.subtotal,
      totalDiscount: calc2.totalDiscount,
      taxableAmount: calc2.taxableAmount,
      totalCgst: calc2.totalCgst,
      totalSgst: calc2.totalSgst,
      totalIgst: calc2.totalIgst,
      totalTax: calc2.totalTax,
      roundOff: calc2.roundOff,
      grandTotal: calc2.grandTotal,
      amountPaid: calc2.grandTotal,
      balanceDue: 0,
      paymentStatus: 'PAID',
      managerId: managerSuresh?._id,
      managerUsername: 'suresh',
      managerName: 'Suresh',
      managerSignature: 'suresh.png',
    });

    await Payment.create({
      invoiceId: inv2._id,
      invoiceNumber: inv2.invoiceNumber,
      customerId: cust2._id,
      customerName: cust2.name,
      amount: calc2.grandTotal,
      paymentMethod: 'UPI',
      referenceNumber: 'UPI/2611/847291',
      paymentDate: date2,
      notes: 'Full payment via Google Pay UPI',
      recordedBy: {
        id: managerSuresh?._id,
        username: 'suresh',
        displayName: 'Suresh',
      },
    });

    // Invoice 3
    const rawItems3 = [
      {
        name: 'MCB 16A Single Pole C-Curve',
        hsn: '8536',
        quantity: 6,
        unit: 'Nos',
        rate: 190.0,
        gstRate: 18,
      },
      {
        name: 'Modular Surface Board 8-Module',
        hsn: '8538',
        quantity: 4,
        unit: 'Nos',
        rate: 160.0,
        gstRate: 18,
      },
    ];
    const calc3 = calculateInvoice(rawItems3, false, true, 0);
    await Invoice.create({
      invoiceNumber: 'SE-2611-003',
      date: date3,
      placeOfSupply: 'Gujarat (24)',
      isInterState: false,
      customer: {
        customerId: cust3._id,
        name: cust3.name,
        mobile: cust3.mobile,
        billingAddress: cust3.billingAddress,
        city: cust3.city,
        state: cust3.state,
      },
      items: calc3.items,
      subtotal: calc3.subtotal,
      totalDiscount: calc3.totalDiscount,
      taxableAmount: calc3.taxableAmount,
      totalCgst: calc3.totalCgst,
      totalSgst: calc3.totalSgst,
      totalIgst: calc3.totalIgst,
      totalTax: calc3.totalTax,
      roundOff: calc3.roundOff,
      grandTotal: calc3.grandTotal,
      amountPaid: 0,
      balanceDue: calc3.balanceDue,
      paymentStatus: 'UNPAID',
      managerId: managerHiren?._id,
      managerUsername: 'hiren',
      managerName: 'Hiren',
      managerSignature: 'hiren.png',
    });

    // Update counter
    await Counter.findOneAndUpdate(
      { _id: 'invoice_seq_2611' },
      { seq: 3 },
      { upsert: true }
    );
    logger.info('✔ Seeded 3 sample invoices and payments');
  }

  logger.info('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  logger.error({ err }, 'Seed execution failed');
  process.exit(1);
});
