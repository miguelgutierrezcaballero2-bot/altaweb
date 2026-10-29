/**
 * OrderManager — Singleton in-memory CRUD for Order entities
 */

import type { Order, OrderStatus, CreateOrderInput, UpdateOrderStatusInput, OrderSummary, Address } from '../types/order';

class OrderManager {
  private static instance: OrderManager;
  private orders: Map<string, Order> = new Map();

  private constructor() {}

  /** Get the singleton instance */
  public static getInstance(): OrderManager {
    if (!OrderManager.instance) {
      OrderManager.instance = new OrderManager();
    }
    return OrderManager.instance;
  }

  /** Create a new order */
  public create(input: CreateOrderInput): Order {
    const now = new Date();
    const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const order: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      userId: input.userId,
      items: input.items,
      subtotal,
      tax,
      total,
      status: 'pending',
      paymentMethod: input.paymentMethod,
      shippingAddress: input.shippingAddress,
      billingAddress: input.billingAddress,
      trackingNumber: input.trackingNumber ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.orders.set(order.id, order);
    return order;
  }

  /** Find an order by ID */
  public findById(id: string): Order | undefined {
    return this.orders.get(id);
  }

  /** Get all orders */
  public findAll(): Order[] {
    return Array.from(this.orders.values());
  }

  /** Find orders by user ID */
  public findByUser(userId: string): Order[] {
    return Array.from(this.orders.values()).filter((o) => o.userId === userId);
  }

  /** Find orders by status */
  public findByStatus(status: OrderStatus): Order[] {
    return Array.from(this.orders.values()).filter((o) => o.status === status);
  }

  /** Update order status */
  public updateStatus(id: string, input: UpdateOrderStatusInput): Order | undefined {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updated: Order = {
      ...order,
      status: input.status,
      updatedAt: new Date(),
    };
    this.orders.set(id, updated);
    return updated;
  }

  /** Cancel an order (sets status to cancelled) */
  public cancel(id: string): Order | undefined {
    return this.updateStatus(id, { status: 'cancelled' });
  }

  /** Update an order by ID */
  public update(id: string, input: Partial<Order>): Order | undefined {
    const order = this.orders.get(id);
    if (!order) return undefined;
    const updated: Order = { ...order, ...input, updatedAt: new Date() };
    this.orders.set(id, updated);
    return updated;
  }

  /** Delete an order by ID */
  public delete(id: string): boolean {
    return this.orders.delete(id);
  }

  /** Get order summary statistics */
  public getSummary(): OrderSummary {
    const allOrders = Array.from(this.orders.values());
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const statusBreakdown: Record<OrderStatus, number> = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    for (const order of allOrders) {
      statusBreakdown[order.status]++;
    }

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      statusBreakdown,
    };
  }
}

export const orderManager = OrderManager.getInstance();
