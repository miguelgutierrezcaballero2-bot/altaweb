/**
 * Shipping — Shipping/management domain types
 */

export type ShippingStatus =
  | 'pending'
  | 'in_transit'
  | 'delivered'
  | 'returned';

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Shipping {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  method: string;
  cost: number;
  estimatedDelivery: Date;
  status: ShippingStatus;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  address: Address;
}

export interface CreateShippingInput {
  orderId: string;
  carrier: string;
  trackingNumber: string;
  method: string;
  cost: number;
  estimatedDelivery: Date;
  address: Address;
}

export interface UpdateShippingStatusInput {
  status: ShippingStatus;
}

export interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: ShippingStatus;
  estimatedDelivery: Date;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  events: TrackingEvent[];
}

export interface TrackingEvent {
  timestamp: Date;
  location: string;
  description: string;
  status: ShippingStatus;
}

export interface CostEstimate {
  carrier: string;
  method: string;
  cost: number;
  estimatedDelivery: Date;
}
