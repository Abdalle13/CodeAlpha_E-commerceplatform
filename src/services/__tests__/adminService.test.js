import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAdminOverview,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getInventoryMatrix,
  adjustInventory,
  getInventoryMovements,
  getAdminOrders,
  updateOrderStatus,
  verifyOrderPayment,
  getAdminCustomers,
  getAuditLogs,
} from '../adminService';

describe('adminService - Live Overview & Analytics', () => {
  it('computes live overview metrics accurately without fabricated numbers', async () => {
    const { data: overview, error } = await getAdminOverview();

    expect(error).toBeNull();
    expect(overview).toBeDefined();
    expect(typeof overview.totalPaidRevenue).toBe('number');
    expect(overview.totalPaidRevenue).toBeGreaterThanOrEqual(0);
    expect(typeof overview.totalOrders).toBe('number');
    expect(typeof overview.pendingOrders).toBe('number');
    expect(typeof overview.lowStockCount).toBe('number');
    expect(overview.catalogSize).toBeGreaterThan(0);
  });
});

describe('adminService - Product Management (CRUD)', () => {
  it('retrieves products list and supports filtering', async () => {
    const { data: allProds } = await getAdminProducts();
    expect(Array.isArray(allProds)).toBe(true);
    expect(allProds.length).toBeGreaterThan(0);

    const { data: womenProds } = await getAdminProducts({ gender: 'women' });
    expect(womenProds.every((p) => p.gender === 'women')).toBe(true);
  });

  it('creates, updates, and deletes a product in the catalog', async () => {
    const newStyle = {
      name: 'Somali Silk Guntiino',
      slug: 'somali-silk-guntiino',
      description: 'Traditional patterned Somali silk wrap.',
      gender: 'women',
      base_price: 110.0,
      is_published: true,
    };

    const { data: created, error: createErr } = await createProduct(newStyle);
    expect(createErr).toBeNull();
    expect(created.name).toBe('Somali Silk Guntiino');

    // Update
    const { data: updated, error: updateErr } = await updateProduct(created.id, {
      base_price: 125.0,
    });
    expect(updateErr).toBeNull();
    expect(updated.base_price).toBe(125.0);

    // Delete
    const { success } = await deleteProduct(created.id);
    expect(success).toBe(true);
  });
});

describe('adminService - Inventory & Adjustments', () => {
  it('retrieves variant inventory matrix with SKUs and quantities', async () => {
    const { data: matrix } = await getInventoryMatrix();
    expect(Array.isArray(matrix)).toBe(true);
    expect(matrix.length).toBeGreaterThan(0);
    expect(matrix[0].sku).toBeDefined();
    expect(typeof matrix[0].quantity).toBe('number');
  });

  it('adjusts stock and records movement audit trail', async () => {
    const { data: matrix } = await getInventoryMatrix();
    const target = matrix[0];
    const prevQty = target.quantity;

    const { data: adjusted, error } = await adjustInventory({
      variantId: target.id || target.variant_id,
      delta: 10,
      reason: 'Received shipment test',
    });

    expect(error).toBeNull();
    expect(adjusted.quantity).toBe(prevQty + 10);

    // Verify movement logged
    const { data: movements } = await getInventoryMovements();
    expect(movements.length).toBeGreaterThan(0);
    expect(movements[0].delta).toBe(10);
    expect(movements[0].reason).toBe('Received shipment test');
  });
});

describe('adminService - Order Management & Payment Verification', () => {
  it('retrieves orders list with status and customer information', async () => {
    const { data: orders } = await getAdminOrders();
    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders[0].order_number).toMatch(/^HLR-/);
  });

  it('updates order status and verifies Pay on Delivery payment', async () => {
    const { data: orders } = await getAdminOrders();
    const order = orders[0];

    const { data: statusUpdated } = await updateOrderStatus(order.id, 'processing', 'Packed in Mogadishu hub');
    expect(statusUpdated.order_status).toBe('processing');

    const { data: payVerified } = await verifyOrderPayment(order.id, 'POD-VERIFIED-1001');
    expect(payVerified.payment_status).toBe('paid');
  });
});

describe('adminService - Customers & Audit Trail', () => {
  it('retrieves registered customer directory', async () => {
    const { data: customers } = await getAdminCustomers();
    expect(Array.isArray(customers)).toBe(true);
    expect(customers.length).toBeGreaterThan(0);
  });

  it('retrieves immutable audit logs', async () => {
    const { data: logs } = await getAuditLogs();
    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].action).toBeDefined();
  });
});
