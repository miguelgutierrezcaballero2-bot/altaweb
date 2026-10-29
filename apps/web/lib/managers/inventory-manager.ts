/**
 * InventoryManager — Singleton in-memory CRUD for Inventory entities
 */

import type { Inventory, CreateInventoryInput, UpdateStockInput, ReserveInput, ReleaseInput, CheckReorderInput, LowStockItem } from '../types/inventory';

class InventoryManager {
  private static instance: InventoryManager;
  private inventories: Map<string, Inventory> = new Map();

  private constructor() {}

  /** Get the singleton instance */
  public static getInstance(): InventoryManager {
    if (!InventoryManager.instance) {
      InventoryManager.instance = new InventoryManager();
    }
    return InventoryManager.instance;
  }

  /** Create a new inventory record */
  public create(input: CreateInventoryInput): Inventory {
    const available = input.quantity;
    const inventory: Inventory = {
      id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      productId: input.productId,
      warehouseId: input.warehouseId,
      quantity: input.quantity,
      reserved: 0,
      available,
      reorderLevel: input.reorderLevel ?? 10,
      lastRestocked: null,
    };
    this.inventories.set(inventory.id, inventory);
    return inventory;
  }

  /** Find an inventory record by ID */
  public findById(id: string): Inventory | undefined {
    return this.inventories.get(id);
  }

  /** Get all inventory records */
  public findAll(): Inventory[] {
    return Array.from(this.inventories.values());
  }

  /** Find inventory by product ID */
  public findByProduct(productId: string): Inventory[] {
    return Array.from(this.inventories.values()).filter(
      (i) => i.productId === productId
    );
  }

  /** Find inventory by warehouse ID */
  public findByWarehouse(warehouseId: string): Inventory[] {
    return Array.from(this.inventories.values()).filter(
      (i) => i.warehouseId === warehouseId
    );
  }

  /** Update stock quantity for an inventory record */
  public updateStock(id: string, input: UpdateStockInput): Inventory | undefined {
    const inv = this.inventories.get(id);
    if (!inv) return undefined;

    const newQuantity = input.quantity ?? inv.quantity;
    const newLastRestocked = input.lastRestocked ?? new Date();
    const available = newQuantity - inv.reserved;

    const updated: Inventory = {
      ...inv,
      quantity: newQuantity,
      available,
      lastRestocked: newLastRestocked,
    };
    this.inventories.set(id, updated);
    return updated;
  }

  /** Reserve stock for a product in a warehouse */
  public reserve(input: ReserveInput): Inventory | undefined {
    const inv = Array.from(this.inventories.values()).find(
      (i) => i.productId === input.productId && i.warehouseId === input.warehouseId
    );
    if (!inv) return undefined;
    if (inv.available < input.quantity) return undefined;

    const updated: Inventory = {
      ...inv,
      reserved: inv.reserved + input.quantity,
      available: inv.available - input.quantity,
    };
    this.inventories.set(inv.id, updated);
    return updated;
  }

  /** Release reserved stock */
  public release(input: ReleaseInput): Inventory | undefined {
    const inv = Array.from(this.inventories.values()).find(
      (i) => i.productId === input.productId && i.warehouseId === input.warehouseId
    );
    if (!inv) return undefined;
    if (inv.reserved < input.quantity) return undefined;

    const updated: Inventory = {
      ...inv,
      reserved: inv.reserved - input.quantity,
      available: inv.available + input.quantity,
    };
    this.inventories.set(inv.id, updated);
    return updated;
  }

  /** Check if inventory needs reorder */
  public checkReorder(input: CheckReorderInput): Inventory[] {
    let items = Array.from(this.inventories.values());
    if (input.productId) {
      items = items.filter((i) => i.productId === input.productId);
    }
    if (input.warehouseId) {
      items = items.filter((i) => i.warehouseId === input.warehouseId);
    }
    return items.filter((i) => i.available <= i.reorderLevel);
  }

  /** Update an inventory record by ID */
  public update(id: string, input: Partial<Inventory>): Inventory | undefined {
    const inv = this.inventories.get(id);
    if (!inv) return undefined;
    const updated: Inventory = { ...inv, ...input };
    this.inventories.set(id, updated);
    return updated;
  }

  /** Delete an inventory record by ID */
  public delete(id: string): boolean {
    return this.inventories.delete(id);
  }

  /** Get all items with low stock */
  public getLowStock(): LowStockItem[] {
    const lowStockInventories = Array.from(this.inventories.values()).filter(
      (i) => i.available <= i.reorderLevel
    );
    // In a real app, we'd join with product data
    return lowStockInventories.map((inv) => ({
      inventory: inv,
      productName: inv.productId, // Placeholder — in production, join with ProductManager
    }));
  }
}

export const inventoryManager = InventoryManager.getInstance();
