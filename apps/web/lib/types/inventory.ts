/**
 * Inventory — Stock management domain types
 */

export interface Inventory {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  reserved: number;
  available: number;
  reorderLevel: number;
  lastRestocked: Date | null;
}

export interface CreateInventoryInput {
  productId: string;
  warehouseId: string;
  quantity: number;
  reorderLevel?: number;
}

export interface UpdateStockInput {
  quantity?: number;
  lastRestocked?: Date | null;
}

export interface ReserveInput {
  productId: string;
  warehouseId: string;
  quantity: number;
}

export interface ReleaseInput {
  productId: string;
  warehouseId: string;
  quantity: number;
}

export interface CheckReorderInput {
  productId?: string;
  warehouseId?: string;
}

export interface LowStockItem {
  inventory: Inventory;
  productName: string;
}
