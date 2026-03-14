export interface User { id: string; name: string; email: string; role: "MANAGER" | "WAREHOUSE"; }
export interface AuthResponse { success: boolean; data: { token: string; user: User; }; }
export type OperationStatus = "DRAFT" | "WAITING" | "READY" | "DONE" | "CANCELED";
export type MovementType = "RECEIPT" | "DELIVERY" | "TRANSFER" | "ADJUSTMENT";
export interface PaginationMeta { total: number; page: number; limit: number; pages: number; }
export interface ApiResponse<T> { success: boolean; data: T; meta?: PaginationMeta; message?: string; }
export interface Warehouse { id: string; name: string; location: string; locations: Location[]; createdAt: string; }
export interface Location { id: string; warehouseId: string; name: string; warehouse?: Warehouse; }
export interface Category { id: string; name: string; }
export interface StockLevel { id: string; productId: string; locationId: string; quantity: number; location: Location & { warehouse: Warehouse }; }
export interface Product { id: string; name: string; sku: string; categoryId: string; category: Category; unitOfMeasure: string; reorderLevel: number; totalStock?: number; stockLevels?: StockLevel[]; createdAt: string; }
export interface ReceiptItem { id: string; receiptId: string; productId: string; locationId: string; quantity: number; product: Pick<Product,"id"|"name"|"sku">; location: Location & { warehouse: { id: string; name: string } }; }
export interface Receipt { id: string; supplier: string; status: OperationStatus; notes?: string; items: ReceiptItem[]; createdAt: string; }
export interface DeliveryItem { id: string; deliveryId: string; productId: string; locationId: string; quantity: number; product: Pick<Product,"id"|"name"|"sku">; location: Location & { warehouse: { id: string; name: string } }; }
export interface Delivery { id: string; customer: string; status: OperationStatus; notes?: string; items: DeliveryItem[]; createdAt: string; }
export interface TransferItem { id: string; transferId: string; productId: string; quantity: number; sourceLocationId: string; destinationLocationId: string; product: Pick<Product,"id"|"name"|"sku">; sourceLocation: Location & { warehouse: { id: string; name: string } }; destinationLocation: Location & { warehouse: { id: string; name: string } }; }
export interface Transfer { id: string; status: OperationStatus; notes?: string; items: TransferItem[]; createdAt: string; }
export interface Adjustment { id: string; productId: string; locationId: string; systemQuantity: number; physicalCount: number; quantityChange: number; reason: string; product: Pick<Product,"id"|"name"|"sku">; location: Location & { warehouse: { id: string; name: string } }; createdAt: string; }
export interface DashboardKpis { totalProducts: number; lowStockItems: number; outOfStockItems: number; pendingReceipts: number; pendingDeliveries: number; pendingTransfers: number; }
export interface ActivityItem { id: string; type: "RECEIPT"|"DELIVERY"|"TRANSFER"; party: string|null; status: OperationStatus; createdAt: string; }
export interface StockAlert { id: string; name: string; sku: string; reorderLevel: number; totalStock?: number; }
export interface LedgerEntry { id: string; productId: string; locationId: string; movementType: MovementType; quantityChange: number; referenceId: string; createdAt: string; product: Pick<Product,"id"|"name"|"sku">; location: Location & { warehouse: { id: string; name: string } }; }
