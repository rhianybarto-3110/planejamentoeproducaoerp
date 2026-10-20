/**
 * PlanoRoxo ERP - Tipos de Dados e Modelos
 * Sistema de Planejamento e Controle da Produção (PCP) para Pequenas Empresas
 */

export type PartnerType = 'cliente' | 'fornecedor' | 'ambos';

export interface Partner {
  id: string;
  name: string;
  tradingName?: string;
  type: PartnerType;
  document: string; // CPF or CNPJ
  email: string;
  phone: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type UnitOfMeasure = 'un' | 'kg' | 'g' | 'm' | 'cm' | 'm2' | 'l' | 'ml' | 'pc';

export interface RawMaterialStockMovement {
  id: string;
  date: string;
  type: 'entrada' | 'saida' | 'ajuste' | 'consumo_op';
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceOpId?: string;
  reason: string;
}

export interface RawMaterial {
  id: string;
  code: string; // MP-001
  name: string;
  unit: UnitOfMeasure;
  currentStock: number;
  minStock: number;
  unitCost: number; // In BRL (R$)
  supplierId?: string; // Links to Partner
  supplierName?: string;
  warehouseLocation?: string;
  movements?: RawMaterialStockMovement[];
  createdAt: string;
  updatedAt: string;
}

export interface BomItem {
  rawMaterialId: string;
  rawMaterialName: string;
  rawMaterialCode: string;
  quantity: number;
  unit: UnitOfMeasure;
  unitCost: number; // snapshot cost
}

export interface Product {
  id: string;
  code: string; // PRD-001
  name: string;
  category: string;
  salePrice: number; // R$
  processTimeMinutes: number; // Manufacturing time per unit in minutes
  description?: string;
  bom: BomItem[]; // Bill of Materials (Ficha Técnica)
  createdAt: string;
  updatedAt: string;
}

export interface CapacitySettings {
  hoursPerDay: number; // e.g., 8 hours
  daysPerWeek: number; // e.g., 5 days
  activeOperators: number; // e.g., 4 operators / workstations
  efficiencyPercent: number; // e.g., 85%
  factoryName: string;
}

export type OrderStatus = 'pendente' | 'confirmado' | 'em_producao' | 'pronto' | 'entregue' | 'cancelado';

export interface OrderItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CustomerOrder {
  id: string;
  code: string; // PED-2026-001
  customerId: string;
  customerName: string;
  orderDate: string; // YYYY-MM-DD
  deliveryDeadline: string; // YYYY-MM-DD
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  linkedOpIds?: string[]; // IDs of generated production orders
  createdAt: string;
  updatedAt: string;
}

export type ProductionOrderStatus = 'pendente' | 'em_producao' | 'concluida' | 'cancelada';

export type ProductionStage = 
  | 'preparacao' 
  | 'corte_usinagem' 
  | 'montagem' 
  | 'acabamento' 
  | 'qualidade' 
  | 'concluido';

export type PriorityLevel = 'baixa' | 'normal' | 'alta' | 'urgente';

export interface ProductionOrder {
  id: string;
  code: string; // OP-2026-001
  orderId?: string; // Optional linked customer order
  orderCode?: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  priority: PriorityLevel;
  startDate: string; // YYYY-MM-DD
  estimatedCompletionDate: string; // YYYY-MM-DD (calculated by capacity & process time)
  actualCompletionDate?: string;
  totalRequiredMinutes: number;
  status: ProductionOrderStatus;
  currentStage: ProductionStage;
  stockDeducted: boolean; // Indicates if raw materials have been drawn from inventory
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  companyName: string;
  role: string;
  avatarUrl?: string;
}

export type ActiveModule = 
  | 'dashboard' 
  | 'products_bom' 
  | 'raw_materials' 
  | 'partners' 
  | 'capacity' 
  | 'orders' 
  | 'production_orders'
  | 'vercel_guide';
