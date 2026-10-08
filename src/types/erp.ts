export type UnitOfMeasure = 'UN' | 'KG' | 'G' | 'M' | 'M2' | 'L' | 'ML' | 'CX';

export interface BOMItem {
  rawMaterialId: string;
  quantityPerUnit: number; // Quantidade de matéria-prima por 1 unidade de produto
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: UnitOfMeasure;
  cycleTimeMinutes: number; // Tempo de processo por unidade em minutos
  standardCost: number; // Custo estimado unitário em R$
  sellingPrice: number; // Preço de venda sugerido
  currentStock: number; // Estoque de produtos acabados
  minStock: number;
  bom: BOMItem[];
  description?: string;
  createdAt: string;
}

export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  unit: UnitOfMeasure;
  currentStock: number;
  minStock: number;
  unitCost: number; // Custo unitário em R$
  supplierId?: string;
  location?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  tradeName?: string; // Nome Fantasia
  document: string; // CNPJ ou CPF
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  document: string;
  contactPerson: string;
  phone: string;
  email: string;
  suppliedMaterialsDescription?: string;
  createdAt: string;
}

export interface WorkCenter {
  id: string;
  code: string;
  name: string;
  sector: string; // ex: Usinagem, Montagem, Pintura, Embalagem
  dailyHours: number; // Horas disponíveis por dia
  shifts: number; // Número de turnos
  operatorsCount: number; // Operadores alocados
  efficiencyPercent: number; // Eficiência histórica (ex: 85%)
  active: boolean;
}

export type SalesOrderStatus = 'pendente' | 'em_producao' | 'concluido' | 'entregue' | 'cancelado';

export interface SalesOrderItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  orderDate: string;
  deliveryDate: string;
  items: SalesOrderItem[];
  totalValue: number;
  status: SalesOrderStatus;
  notes?: string;
  createdAt: string;
}

export type ProductionOrderStatus = 
  | 'planejada' 
  | 'preparacao' 
  | 'em_producao' 
  | 'qualidade' 
  | 'concluida' 
  | 'cancelada';

export interface ProductionOrderBOMSnapshot {
  rawMaterialId: string;
  rawMaterialCode: string;
  rawMaterialName: string;
  unit: UnitOfMeasure;
  requiredQuantity: number;
  stockAvailableAtCreation: number;
  unitCost: number;
}

export interface ProductionOrderLog {
  timestamp: string;
  status: ProductionOrderStatus;
  user: string;
  notes?: string;
}

export interface ProductionOrder {
  id: string;
  code: string; // Ex: OP-2026-001
  salesOrderId?: string;
  salesOrderNumber?: string;
  customerId?: string;
  customerName?: string;
  
  productId: string;
  productCode: string;
  productName: string;
  
  targetQuantity: number; // Quantidade planejada
  producedQuantity: number; // Quantidade boa concluída
  scrapQuantity: number; // Perdas / Refugos
  
  unitCycleMinutes: number; // Tempo de processo unitário
  totalPlannedMinutes: number; // Tempo total planejado em minutos
  actualMinutesSpent?: number; // Tempo real gasto apontado
  
  workCenterId?: string;
  workCenterName?: string;
  
  startDate: string;
  expectedEndDate: string;
  completedDate?: string;
  
  status: ProductionOrderStatus;
  
  responsibleTechnician: string; // Nome do Responsável Técnico
  responsibleCouncil?: string; // Registro CREA/CRQ etc
  
  notes?: string;
  priority: 'baixa' | 'normal' | 'alta' | 'urgente';
  
  bomSnapshot: ProductionOrderBOMSnapshot[];
  logs: ProductionOrderLog[];
  
  createdAt: string;
}

export interface CompanySettings {
  companyName: string;
  tradeName: string;
  cnpj: string;
  stateRegistration: string;
  phone: string;
  email: string;
  address: string;
  cityState: string;
  responsibleName: string;
  responsibleRole: string;
  responsibleCouncil: string; // Ex: CREA-SP 123456/D
}
