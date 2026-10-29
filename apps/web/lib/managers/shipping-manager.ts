/**
 * ShippingManager — Singleton in-memory CRUD for Shipping entities
 */

import type {
  Shipping,
  CreateShippingInput,
  UpdateShippingStatusInput,
  TrackingInfo,
  TrackingEvent,
  CostEstimate,
  ShippingStatus,
  Address,
} from '../types/shipping';

class ShippingManager {
  private static instance: ShippingManager;
  private shipments: Map<string, Shipping> = new Map();

  private constructor() {}

  /** Get the singleton instance */
  public static getInstance(): ShippingManager {
    if (!ShippingManager.instance) {
      ShippingManager.instance = new ShippingManager();
    }
    return ShippingManager.instance;
  }

  /** Create a new shipping record */
  public create(input: CreateShippingInput): Shipping {
    const shipping: Shipping = {
      id: `ship_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      orderId: input.orderId,
      carrier: input.carrier,
      trackingNumber: input.trackingNumber,
      method: input.method,
      cost: input.cost,
      estimatedDelivery: input.estimatedDelivery,
      status: 'pending',
      shippedAt: null,
      deliveredAt: null,
      address: input.address,
    };
    this.shipments.set(shipping.id, shipping);
    return shipping;
  }

  /** Find a shipping record by ID */
  public findById(id: string): Shipping | undefined {
    return this.shipments.get(id);
  }

  /** Get all shipping records */
  public findAll(): Shipping[] {
    return Array.from(this.shipments.values());
  }

  /** Update a shipping record by ID */
  public update(id: string, input: Partial<Shipping>): Shipping | undefined {
    const shipment = this.shipments.get(id);
    if (!shipment) return undefined;
    const updated: Shipping = { ...shipment, ...input };
    this.shipments.set(id, updated);
    return updated;
  }

  /** Delete a shipping record by ID */
  public delete(id: string): boolean {
    return this.shipments.delete(id);
  }

  /** Find shipping by order ID */
  public findByOrder(orderId: string): Shipping | undefined {
    return Array.from(this.shipments.values()).find((s) => s.orderId === orderId);
  }

  /** Find shipping records by carrier */
  public findByCarrier(carrier: string): Shipping[] {
    return Array.from(this.shipments.values()).filter((s) => s.carrier === carrier);
  }

  /** Update shipping status */
  public updateStatus(id: string, input: UpdateShippingStatusInput): Shipping | undefined {
    const shipment = this.shipments.get(id);
    if (!shipment) return undefined;

    const updated: Shipping = {
      ...shipment,
      status: input.status,
      shippedAt: input.status === 'in_transit' ? new Date() : shipment.shippedAt,
      deliveredAt: input.status === 'delivered' ? new Date() : shipment.deliveredAt,
    };
    this.shipments.set(id, updated);
    return updated;
  }

  /** Get tracking information for a shipment */
  public getTracking(id: string): TrackingInfo | undefined {
    const shipment = this.shipments.get(id);
    if (!shipment) return undefined;

    const events: TrackingEvent[] = [];
    if (shipment.shippedAt) {
      events.push({
        timestamp: shipment.shippedAt,
        location: 'Warehouse',
        description: 'Package shipped',
        status: 'in_transit',
      });
    }
    if (shipment.deliveredAt) {
      events.push({
        timestamp: shipment.deliveredAt,
        location: 'Destination',
        description: 'Package delivered',
        status: 'delivered',
      });
    }

    return {
      trackingNumber: shipment.trackingNumber,
      carrier: shipment.carrier,
      status: shipment.status,
      estimatedDelivery: shipment.estimatedDelivery,
      shippedAt: shipment.shippedAt,
      deliveredAt: shipment.deliveredAt,
      events,
    };
  }

  /** Estimate shipping cost (returns sample estimates) */
  public estimateCost(
    address: Address,
    weight: number,
    method: string
  ): CostEstimate[] {
    const baseCost = weight * 2.5;
    const carriers = [
      { carrier: 'Standard', surcharge: 0 },
      { carrier: 'Express', surcharge: 15 },
      { carrier: 'Overnight', surcharge: 30 },
    ];

    return carriers.map((c) => ({
      carrier: c.carrier,
      method,
      cost: Math.round((baseCost + c.surcharge) * 100) / 100,
      estimatedDelivery: new Date(Date.now() + (c.carrier === 'Standard' ? 7 : c.carrier === 'Express' ? 3 : 1) * 86400000),
    }));
  }
}

export const shippingManager = ShippingManager.getInstance();
