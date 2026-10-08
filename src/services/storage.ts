import {
  Product,
  RawMaterial,
  Customer,
  Supplier,
  WorkCenter,
  SalesOrder,
  ProductionOrder,
  CompanySettings,
  ProductionOrderStatus
} from '../types/erp';

const STORAGE_KEYS = {
  SETTINGS: 'mini_erp_settings',
  PRODUCTS: 'mini_erp_products',
  MATERIALS: 'mini_erp_materials',
  CUSTOMERS: 'mini_erp_customers',
  SUPPLIERS: 'mini_erp_suppliers',
  WORK_CENTERS: 'mini_erp_work_centers',
  SALES_ORDERS: 'mini_erp_sales_orders',
  PRODUCTION_ORDERS: 'mini_erp_production_orders',
};

const DEFAULT_SETTINGS: CompanySettings = {
  companyName: 'Indústria & Manufatura Brasil Ltda',
  tradeName: 'Indumax Equipamentos',
  cnpj: '12.345.678/0001-90',
  stateRegistration: '110.234.567.890',
  phone: '(11) 3456-7890',
  email: 'contato@indumax.ind.br',
  address: 'Av. Industrial, 1500 - Distrito Industrial',
  cityState: 'São Paulo - SP',
  responsibleName: 'Eng. Carlos Eduardo Ribeiro',
  responsibleRole: 'Gerente de Produção & PCP',
  responsibleCouncil: 'CREA-SP 506.789/D',
};

const DEFAULT_MATERIALS: RawMaterial[] = [
  {
    id: 'mat-1',
    code: 'MP-001',
    name: 'Aço Carbono SAE 1020 (Barra Redonda 2")',
    unit: 'KG',
    currentStock: 450,
    minStock: 100,
    unitCost: 14.50,
    supplierId: 'sup-1',
    location: 'Galpão A - Prateleira 01',
    createdAt: '2026-01-10',
  },
  {
    id: 'mat-2',
    code: 'MP-002',
    name: 'Chapa de Alumínio 3mm (Corte 1x2m)',
    unit: 'M2',
    currentStock: 85,
    minStock: 25,
    unitCost: 68.00,
    supplierId: 'sup-2',
    location: 'Galpão A - Prateleira 04',
    createdAt: '2026-01-11',
  },
  {
    id: 'mat-3',
    code: 'MP-003',
    name: 'Parafuso Allen Sextavado M8 x 30mm Inox',
    unit: 'UN',
    currentStock: 1200,
    minStock: 300,
    unitCost: 1.25,
    supplierId: 'sup-1',
    location: 'Almoxarifado - Gaveta 12',
    createdAt: '2026-01-12',
  },
  {
    id: 'mat-4',
    code: 'MP-004',
    name: 'Tinta Eletrostática a Pó Preto Fosco',
    unit: 'KG',
    currentStock: 42,
    minStock: 15,
    unitCost: 35.80,
    supplierId: 'sup-3',
    location: 'Galpão B - Setor Químico',
    createdAt: '2026-01-15',
  },
  {
    id: 'mat-5',
    code: 'MP-005',
    name: 'Bucha de Bronze Autolubrificante Ø25mm',
    unit: 'UN',
    currentStock: 95,
    minStock: 30,
    unitCost: 18.20,
    supplierId: 'sup-2',
    location: 'Almoxarifado - Gaveta 08',
    createdAt: '2026-01-20',
  },
  {
    id: 'mat-6',
    code: 'MP-006',
    name: 'Caixa de Papelão Reforçada P/ Transporte',
    unit: 'UN',
    currentStock: 180,
    minStock: 50,
    unitCost: 6.50,
    supplierId: 'sup-3',
    location: 'Setor de Expedição',
    createdAt: '2026-01-22',
  },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    code: 'PA-101',
    name: 'Mancal Industrial com Bucha Bronze Ø25mm',
    category: 'Componentes Mecânicos',
    unit: 'UN',
    cycleTimeMinutes: 45, // 45 minutos por unidade
    standardCost: 82.50,
    sellingPrice: 195.00,
    currentStock: 18,
    minStock: 10,
    bom: [
      { rawMaterialId: 'mat-1', quantityPerUnit: 2.2 }, // 2.2 kg de aço
      { rawMaterialId: 'mat-5', quantityPerUnit: 1 }, // 1 bucha bronze
      { rawMaterialId: 'mat-3', quantityPerUnit: 4 }, // 4 parafusos
      { rawMaterialId: 'mat-4', quantityPerUnit: 0.15 }, // 0.15 kg tinta
      { rawMaterialId: 'mat-6', quantityPerUnit: 1 }, // 1 embalagem
    ],
    description: 'Mancal usinado em torno CNC com acabamento em pintura eletrostática e bucha bronze sintetizado.',
    createdAt: '2026-01-15',
  },
  {
    id: 'prod-2',
    code: 'PA-102',
    name: 'Suporte Articulado em Alumínio 300mm',
    category: 'Estruturas Leves',
    unit: 'UN',
    cycleTimeMinutes: 30, // 30 minutos por unidade
    standardCost: 55.00,
    sellingPrice: 140.00,
    currentStock: 25,
    minStock: 15,
    bom: [
      { rawMaterialId: 'mat-2', quantityPerUnit: 0.4 }, // 0.4 m2 chapa aluminio
      { rawMaterialId: 'mat-3', quantityPerUnit: 6 }, // 6 parafusos inox
      { rawMaterialId: 'mat-4', quantityPerUnit: 0.1 }, // 0.1 kg tinta
      { rawMaterialId: 'mat-6', quantityPerUnit: 1 }, // 1 embalagem
    ],
    description: 'Suporte articulado cortado a laser e dobrado em dobradeira CNC com revestimento especial.',
    createdAt: '2026-01-16',
  },
  {
    id: 'prod-3',
    code: 'PA-103',
    name: 'Eixo Transmissor Retificado 400mm',
    category: 'Usinagem de Precisão',
    unit: 'UN',
    cycleTimeMinutes: 60, // 60 minutos por unidade
    standardCost: 75.00,
    sellingPrice: 180.00,
    currentStock: 8,
    minStock: 5,
    bom: [
      { rawMaterialId: 'mat-1', quantityPerUnit: 3.5 }, // 3.5 kg de aço
      { rawMaterialId: 'mat-6', quantityPerUnit: 1 },
    ],
    description: 'Eixo cilíndrico torneado e retificado com tolerância h6 para transmissões mecânicas pesadas.',
    createdAt: '2026-01-20',
  },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'AgroMáquinas do Sul Equipamentos S.A.',
    tradeName: 'AgroSul',
    document: '45.123.789/0001-44',
    phone: '(51) 3211-9988',
    email: 'compras@agrosul.com.br',
    address: 'Rodovia RS-118, Km 12',
    city: 'Gravataí',
    state: 'RS',
    createdAt: '2026-01-05',
  },
  {
    id: 'cust-2',
    name: 'Metalmec Indústria Metalúrgica Ltda',
    tradeName: 'Metalmec Peças',
    document: '18.987.654/0001-22',
    phone: '(19) 3888-4455',
    email: 'pedidos@metalmec.ind.br',
    address: 'Rua das Indústrias, 840',
    city: 'Campinas',
    state: 'SP',
    createdAt: '2026-01-08',
  },
  {
    id: 'cust-3',
    name: 'TecnoAutomação Comércio de Componentes Eireli',
    tradeName: 'TecnoAuto',
    document: '29.345.123/0001-77',
    phone: '(47) 3455-1234',
    email: 'suprimentos@tecnoauto.com.br',
    address: 'Rua Blumenau, 230',
    city: 'Joinville',
    state: 'SC',
    createdAt: '2026-01-12',
  },
];

const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Gerdau Siderúrgica Distribuidora S.A.',
    document: '33.611.500/0001-19',
    contactPerson: 'Marcos Vinicius',
    phone: '(11) 4004-9090',
    email: 'vendas.sp@gerdau.com',
    suppliedMaterialsDescription: 'Aço carbono, barras redondas laminadas, parafusos e fixadores industriais.',
    createdAt: '2026-01-02',
  },
  {
    id: 'sup-2',
    name: 'Alumínios Paulistas Distribuidora Ltda',
    document: '04.567.890/0001-33',
    contactPerson: 'Renata Castro',
    phone: '(11) 2233-4455',
    email: 'contato@aluminapaulista.com.br',
    suppliedMaterialsDescription: 'Chapas de alumínio 5052/6063, perfis extrudados e buchas de bronze.',
    createdAt: '2026-01-03',
  },
  {
    id: 'sup-3',
    name: 'Química & Embalagens Industriais Ltda',
    document: '08.123.456/0001-88',
    contactPerson: 'Alexandre Souza',
    phone: '(11) 3322-1100',
    email: 'comercial@quimicaindustrial.com.br',
    suppliedMaterialsDescription: 'Tintas em pó eletrostáticas, solventes, caixas de papelão e fitas de arqueamento.',
    createdAt: '2026-01-04',
  },
];

const DEFAULT_WORK_CENTERS: WorkCenter[] = [
  {
    id: 'wc-1',
    code: 'POSTO-01',
    name: 'Usinagem CNC (Tornos e Centro de Usinagem)',
    sector: 'Usinagem',
    dailyHours: 8,
    shifts: 2, // 2 turnos de 8h = 16h/dia
    operatorsCount: 3,
    efficiencyPercent: 88,
    active: true,
  },
  {
    id: 'wc-2',
    code: 'POSTO-02',
    name: 'Corte e Dobra (Laser e Dobradeira)',
    sector: 'Caldeiraria Leve',
    dailyHours: 8,
    shifts: 1, // 8h/dia
    operatorsCount: 2,
    efficiencyPercent: 92,
    active: true,
  },
  {
    id: 'wc-3',
    code: 'POSTO-03',
    name: 'Pintura Eletrostática e Tratamento Térmico',
    sector: 'Acabamento',
    dailyHours: 8,
    shifts: 1, // 8h/dia
    operatorsCount: 2,
    efficiencyPercent: 85,
    active: true,
  },
  {
    id: 'wc-4',
    code: 'POSTO-04',
    name: 'Bancada de Montagem e Testes de Qualidade',
    sector: 'Montagem Final',
    dailyHours: 8,
    shifts: 2, // 16h/dia
    operatorsCount: 4,
    efficiencyPercent: 90,
    active: true,
  },
];

const DEFAULT_SALES_ORDERS: SalesOrder[] = [
  {
    id: 'so-1',
    orderNumber: 'PED-2026-01',
    customerId: 'cust-1',
    customerName: 'AgroMáquinas do Sul Equipamentos S.A.',
    orderDate: '2026-10-01',
    deliveryDate: '2026-10-15',
    items: [
      {
        productId: 'prod-1',
        productName: 'Mancal Industrial com Bucha Bronze Ø25mm',
        productCode: 'PA-101',
        quantity: 20,
        unitPrice: 195.00,
        totalPrice: 3900.00,
      },
    ],
    totalValue: 3900.00,
    status: 'em_producao',
    notes: 'Entrega prioritária para linha de montagem de colheitadeiras.',
    createdAt: '2026-10-01',
  },
  {
    id: 'so-2',
    orderNumber: 'PED-2026-02',
    customerId: 'cust-2',
    customerName: 'Metalmec Indústria Metalúrgica Ltda',
    orderDate: '2026-10-03',
    deliveryDate: '2026-10-20',
    items: [
      {
        productId: 'prod-2',
        productName: 'Suporte Articulado em Alumínio 300mm',
        productCode: 'PA-102',
        quantity: 35,
        unitPrice: 140.00,
        totalPrice: 4900.00,
      },
    ],
    totalValue: 4900.00,
    status: 'pendente',
    notes: 'Aguardando confirmação de lote de faturamento.',
    createdAt: '2026-10-03',
  },
  {
    id: 'so-3',
    orderNumber: 'PED-2026-03',
    customerId: 'cust-3',
    customerName: 'TecnoAutomação Comércio de Componentes Eireli',
    orderDate: '2026-09-20',
    deliveryDate: '2026-10-05',
    items: [
      {
        productId: 'prod-3',
        productName: 'Eixo Transmissor Retificado 400mm',
        productCode: 'PA-103',
        quantity: 15,
        unitPrice: 180.00,
        totalPrice: 2700.00,
      },
    ],
    totalValue: 2700.00,
    status: 'concluido',
    notes: 'Pedido concluído e faturado.',
    createdAt: '2026-09-20',
  },
];

const DEFAULT_PRODUCTION_ORDERS: ProductionOrder[] = [
  {
    id: 'op-1',
    code: 'OP-2026-001',
    salesOrderId: 'so-1',
    salesOrderNumber: 'PED-2026-01',
    customerId: 'cust-1',
    customerName: 'AgroMáquinas do Sul Equipamentos S.A.',
    productId: 'prod-1',
    productCode: 'PA-101',
    productName: 'Mancal Industrial com Bucha Bronze Ø25mm',
    targetQuantity: 20,
    producedQuantity: 12,
    scrapQuantity: 1,
    unitCycleMinutes: 45,
    totalPlannedMinutes: 900, // 15 horas
    actualMinutesSpent: 540,
    workCenterId: 'wc-1',
    workCenterName: 'Usinagem CNC (Tornos e Centro de Usinagem)',
    startDate: '2026-10-04',
    expectedEndDate: '2026-10-10',
    status: 'em_producao',
    responsibleTechnician: 'Eng. Carlos Eduardo Ribeiro',
    responsibleCouncil: 'CREA-SP 506.789/D',
    priority: 'alta',
    notes: 'Ajuste fino de rugosidade Ra 0.8 no alojamento da bucha.',
    bomSnapshot: [
      {
        rawMaterialId: 'mat-1',
        rawMaterialCode: 'MP-001',
        rawMaterialName: 'Aço Carbono SAE 1020 (Barra Redonda 2")',
        unit: 'KG',
        requiredQuantity: 44,
        stockAvailableAtCreation: 450,
        unitCost: 14.50,
      },
      {
        rawMaterialId: 'mat-5',
        rawMaterialCode: 'MP-005',
        rawMaterialName: 'Bucha de Bronze Autolubrificante Ø25mm',
        unit: 'UN',
        requiredQuantity: 20,
        stockAvailableAtCreation: 95,
        unitCost: 18.20,
      },
      {
        rawMaterialId: 'mat-3',
        rawMaterialCode: 'MP-003',
        rawMaterialName: 'Parafuso Allen Sextavado M8 x 30mm Inox',
        unit: 'UN',
        requiredQuantity: 80,
        stockAvailableAtCreation: 1200,
        unitCost: 1.25,
      },
      {
        rawMaterialId: 'mat-4',
        rawMaterialCode: 'MP-004',
        rawMaterialName: 'Tinta Eletrostática a Pó Preto Fosco',
        unit: 'KG',
        requiredQuantity: 3.0,
        stockAvailableAtCreation: 42,
        unitCost: 35.80,
      },
    ],
    logs: [
      {
        timestamp: '2026-10-04 08:00',
        status: 'planejada',
        user: 'Eng. Carlos Eduardo Ribeiro',
        notes: 'Ordem de produção criada a partir do pedido PED-2026-01',
      },
      {
        timestamp: '2026-10-05 08:30',
        status: 'preparacao',
        user: 'Operador Márcio Lima',
        notes: 'Setup de ferramental e mordentes realizado no CNC 02',
      },
      {
        timestamp: '2026-10-06 09:00',
        status: 'em_producao',
        user: 'Eng. Carlos Eduardo Ribeiro',
        notes: 'Início de usinagem contínua',
      },
    ],
    createdAt: '2026-10-04',
  },
  {
    id: 'op-2',
    code: 'OP-2026-002',
    salesOrderId: 'so-3',
    salesOrderNumber: 'PED-2026-03',
    customerId: 'cust-3',
    customerName: 'TecnoAutomação Comércio de Componentes Eireli',
    productId: 'prod-3',
    productCode: 'PA-103',
    productName: 'Eixo Transmissor Retificado 400mm',
    targetQuantity: 15,
    producedQuantity: 15,
    scrapQuantity: 0,
    unitCycleMinutes: 60,
    totalPlannedMinutes: 900,
    actualMinutesSpent: 870,
    workCenterId: 'wc-1',
    workCenterName: 'Usinagem CNC (Tornos e Centro de Usinagem)',
    startDate: '2026-09-22',
    expectedEndDate: '2026-09-28',
    completedDate: '2026-09-28',
    status: 'concluida',
    responsibleTechnician: 'Eng. Carlos Eduardo Ribeiro',
    responsibleCouncil: 'CREA-SP 506.789/D',
    priority: 'normal',
    notes: 'Lote concluído com 100% de conformidade dimensional.',
    bomSnapshot: [
      {
        rawMaterialId: 'mat-1',
        rawMaterialCode: 'MP-001',
        rawMaterialName: 'Aço Carbono SAE 1020 (Barra Redonda 2")',
        unit: 'KG',
        requiredQuantity: 52.5,
        stockAvailableAtCreation: 500,
        unitCost: 14.50,
      },
    ],
    logs: [
      {
        timestamp: '2026-09-22 08:00',
        status: 'planejada',
        user: 'Eng. Carlos Eduardo Ribeiro',
        notes: 'Abertura da OP',
      },
      {
        timestamp: '2026-09-28 17:00',
        status: 'concluida',
        user: 'Eng. Carlos Eduardo Ribeiro',
        notes: 'Baixa de produção concluída com sucesso. 15 peças aprovadas.',
      },
    ],
    createdAt: '2026-09-22',
  },
];

// Helper to safely parse localStorage
function loadItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Erro ao carregar chave ${key}:`, err);
    return fallback;
  }
}

function saveItem<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Erro ao salvar chave ${key}:`, err);
  }
}

export const StorageService = {
  // Settings
  getSettings(): CompanySettings {
    return loadItem<CompanySettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },
  saveSettings(settings: CompanySettings): void {
    saveItem(STORAGE_KEYS.SETTINGS, settings);
  },

  // Products
  getProducts(): Product[] {
    return loadItem<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  },
  saveProducts(products: Product[]): void {
    saveItem(STORAGE_KEYS.PRODUCTS, products);
  },
  addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
    const products = this.getProducts();
    const newProd: Product = {
      ...product,
      id: 'prod-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    products.unshift(newProd);
    this.saveProducts(products);
    return newProd;
  },
  updateProduct(product: Product): void {
    const products = this.getProducts().map(p => p.id === product.id ? product : p);
    this.saveProducts(products);
  },
  deleteProduct(id: string): void {
    const products = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(products);
  },

  // Raw Materials
  getMaterials(): RawMaterial[] {
    return loadItem<RawMaterial[]>(STORAGE_KEYS.MATERIALS, DEFAULT_MATERIALS);
  },
  saveMaterials(materials: RawMaterial[]): void {
    saveItem(STORAGE_KEYS.MATERIALS, materials);
  },
  addMaterial(material: Omit<RawMaterial, 'id' | 'createdAt'>): RawMaterial {
    const materials = this.getMaterials();
    const newMat: RawMaterial = {
      ...material,
      id: 'mat-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    materials.unshift(newMat);
    this.saveMaterials(materials);
    return newMat;
  },
  updateMaterial(material: RawMaterial): void {
    const materials = this.getMaterials().map(m => m.id === material.id ? material : m);
    this.saveMaterials(materials);
  },
  deleteMaterial(id: string): void {
    const materials = this.getMaterials().filter(m => m.id !== id);
    this.saveMaterials(materials);
  },
  adjustMaterialStock(id: string, delta: number): void {
    const materials = this.getMaterials().map(m => {
      if (m.id === id) {
        return { ...m, currentStock: Math.max(0, Number((m.currentStock + delta).toFixed(2))) };
      }
      return m;
    });
    this.saveMaterials(materials);
  },

  // Customers
  getCustomers(): Customer[] {
    return loadItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
  },
  saveCustomers(customers: Customer[]): void {
    saveItem(STORAGE_KEYS.CUSTOMERS, customers);
  },
  addCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Customer {
    const list = this.getCustomers();
    const newCust: Customer = {
      ...customer,
      id: 'cust-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    list.unshift(newCust);
    this.saveCustomers(list);
    return newCust;
  },
  updateCustomer(customer: Customer): void {
    const list = this.getCustomers().map(c => c.id === customer.id ? customer : c);
    this.saveCustomers(list);
  },
  deleteCustomer(id: string): void {
    const list = this.getCustomers().filter(c => c.id !== id);
    this.saveCustomers(list);
  },

  // Suppliers
  getSuppliers(): Supplier[] {
    return loadItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, DEFAULT_SUPPLIERS);
  },
  saveSuppliers(suppliers: Supplier[]): void {
    saveItem(STORAGE_KEYS.SUPPLIERS, suppliers);
  },
  addSupplier(supplier: Omit<Supplier, 'id' | 'createdAt'>): Supplier {
    const list = this.getSuppliers();
    const newSup: Supplier = {
      ...supplier,
      id: 'sup-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    list.unshift(newSup);
    this.saveSuppliers(list);
    return newSup;
  },
  updateSupplier(supplier: Supplier): void {
    const list = this.getSuppliers().map(s => s.id === supplier.id ? supplier : s);
    this.saveSuppliers(list);
  },
  deleteSupplier(id: string): void {
    const list = this.getSuppliers().filter(s => s.id !== id);
    this.saveSuppliers(list);
  },

  // Work Centers (Capacidade Produtiva)
  getWorkCenters(): WorkCenter[] {
    return loadItem<WorkCenter[]>(STORAGE_KEYS.WORK_CENTERS, DEFAULT_WORK_CENTERS);
  },
  saveWorkCenters(centers: WorkCenter[]): void {
    saveItem(STORAGE_KEYS.WORK_CENTERS, centers);
  },
  addWorkCenter(center: Omit<WorkCenter, 'id'>): WorkCenter {
    const list = this.getWorkCenters();
    const newWc: WorkCenter = {
      ...center,
      id: 'wc-' + Date.now(),
    };
    list.push(newWc);
    this.saveWorkCenters(list);
    return newWc;
  },
  updateWorkCenter(center: WorkCenter): void {
    const list = this.getWorkCenters().map(w => w.id === center.id ? center : w);
    this.saveWorkCenters(list);
  },
  deleteWorkCenter(id: string): void {
    const list = this.getWorkCenters().filter(w => w.id !== id);
    this.saveWorkCenters(list);
  },

  // Sales Orders
  getSalesOrders(): SalesOrder[] {
    return loadItem<SalesOrder[]>(STORAGE_KEYS.SALES_ORDERS, DEFAULT_SALES_ORDERS);
  },
  saveSalesOrders(orders: SalesOrder[]): void {
    saveItem(STORAGE_KEYS.SALES_ORDERS, orders);
  },
  addSalesOrder(order: Omit<SalesOrder, 'id' | 'createdAt'>): SalesOrder {
    const list = this.getSalesOrders();
    const newOrder: SalesOrder = {
      ...order,
      id: 'so-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    list.unshift(newOrder);
    this.saveSalesOrders(list);
    return newOrder;
  },
  updateSalesOrder(order: SalesOrder): void {
    const list = this.getSalesOrders().map(o => o.id === order.id ? order : o);
    this.saveSalesOrders(list);
  },
  deleteSalesOrder(id: string): void {
    const list = this.getSalesOrders().filter(o => o.id !== id);
    this.saveSalesOrders(list);
  },

  // Production Orders (Ordens de Produção)
  getProductionOrders(): ProductionOrder[] {
    return loadItem<ProductionOrder[]>(STORAGE_KEYS.PRODUCTION_ORDERS, DEFAULT_PRODUCTION_ORDERS);
  },
  saveProductionOrders(orders: ProductionOrder[]): void {
    saveItem(STORAGE_KEYS.PRODUCTION_ORDERS, orders);
  },
  addProductionOrder(op: Omit<ProductionOrder, 'id' | 'createdAt' | 'logs'> & { initialNote?: string }): ProductionOrder {
    const list = this.getProductionOrders();
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newOP: ProductionOrder = {
      ...op,
      id: 'op-' + Date.now(),
      logs: [
        {
          timestamp: nowStr,
          status: op.status,
          user: op.responsibleTechnician,
          notes: op.initialNote || 'Ordem de Produção emitida no sistema.',
        },
      ],
      createdAt: new Date().toISOString().split('T')[0],
    };
    list.unshift(newOP);
    this.saveProductionOrders(list);

    // If linked to sales order, update sales order status to 'em_producao'
    if (newOP.salesOrderId) {
      const salesOrders = this.getSalesOrders();
      const so = salesOrders.find(s => s.id === newOP.salesOrderId);
      if (so && so.status === 'pendente') {
        so.status = 'em_producao';
        this.saveSalesOrders(salesOrders);
      }
    }

    return newOP;
  },
  updateProductionOrderStatus(id: string, newStatus: ProductionOrderStatus, user: string, note?: string): void {
    const list = this.getProductionOrders();
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const op = list.find(o => o.id === id);
    if (!op) return;

    op.status = newStatus;
    op.logs.push({
      timestamp: nowStr,
      status: newStatus,
      user,
      notes: note || `Status alterado para ${newStatus}`,
    });

    this.saveProductionOrders(list);
  },

  // Baixa / Conclusão de Ordem de Produção
  // Executa:
  // 1. Atualização do status da OP para 'concluida'
  // 2. Registro de quantidade boa produzida e perdas/refugos
  // 3. Baixa automática no estoque das matérias-primas consumidas (proporcional à produção)
  // 4. Entrada no estoque do produto acabado
  // 5. Atualização do status do pedido vinculado (se houver)
  completeProductionOrder(params: {
    opId: string;
    producedQuantity: number;
    scrapQuantity: number;
    actualMinutesSpent: number;
    user: string;
    notes?: string;
  }): { success: boolean; message: string } {
    const opList = this.getProductionOrders();
    const op = opList.find(o => o.id === params.opId);
    if (!op) return { success: false, message: 'Ordem de produção não encontrada' };

    const totalProcessed = params.producedQuantity + params.scrapQuantity;
    if (totalProcessed <= 0) {
      return { success: false, message: 'Quantidade processada deve ser maior que zero' };
    }

    // 1. Atualizar OP
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    op.status = 'concluida';
    op.producedQuantity = params.producedQuantity;
    op.scrapQuantity = params.scrapQuantity;
    op.actualMinutesSpent = params.actualMinutesSpent;
    op.completedDate = new Date().toISOString().split('T')[0];
    op.logs.push({
      timestamp: nowStr,
      status: 'concluida',
      user: params.user,
      notes: params.notes || `Baixa concluída: ${params.producedQuantity} un boas, ${params.scrapQuantity} un refugo.`,
    });

    // 2. Baixa de estoque das matérias-primas da ficha técnica (BOM)
    const materials = this.getMaterials();
    const products = this.getProducts();
    const product = products.find(p => p.id === op.productId);

    if (product && product.bom.length > 0) {
      // Baixar insumos proporcionalmente ao total processado (boas + refugo consumiram insumo)
      product.bom.forEach(item => {
        const consumed = Number((item.quantityPerUnit * totalProcessed).toFixed(2));
        const mat = materials.find(m => m.id === item.rawMaterialId);
        if (mat) {
          mat.currentStock = Math.max(0, Number((mat.currentStock - consumed).toFixed(2)));
        }
      });
      this.saveMaterials(materials);
    }

    // 3. Entrada de produto acabado no estoque
    if (product) {
      product.currentStock = (product.currentStock || 0) + params.producedQuantity;
      this.saveProducts(products);
    }

    // 4. Atualizar pedido de venda vinculado
    if (op.salesOrderId) {
      const salesOrders = this.getSalesOrders();
      const so = salesOrders.find(s => s.id === op.salesOrderId);
      if (so) {
        // Verificar se todas as OPs desse pedido estão concluídas
        const relatedOps = opList.filter(o => o.salesOrderId === so.id && o.id !== op.id);
        const allCompleted = relatedOps.every(o => o.status === 'concluida');
        if (allCompleted) {
          so.status = 'concluido';
          this.saveSalesOrders(salesOrders);
        }
      }
    }

    this.saveProductionOrders(opList);
    return { success: true, message: `OP ${op.code} concluída com sucesso! Estoque atualizado.` };
  },

  deleteProductionOrder(id: string): void {
    const list = this.getProductionOrders().filter(o => o.id !== id);
    this.saveProductionOrders(list);
  },

  // Backup & Restore
  exportDatabase(): string {
    const dump = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      settings: this.getSettings(),
      materials: this.getMaterials(),
      products: this.getProducts(),
      customers: this.getCustomers(),
      suppliers: this.getSuppliers(),
      workCenters: this.getWorkCenters(),
      salesOrders: this.getSalesOrders(),
      productionOrders: this.getProductionOrders(),
    };
    return JSON.stringify(dump, null, 2);
  },

  importDatabase(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) saveItem(STORAGE_KEYS.SETTINGS, data.settings);
      if (data.materials) saveItem(STORAGE_KEYS.MATERIALS, data.materials);
      if (data.products) saveItem(STORAGE_KEYS.PRODUCTS, data.products);
      if (data.customers) saveItem(STORAGE_KEYS.CUSTOMERS, data.customers);
      if (data.suppliers) saveItem(STORAGE_KEYS.SUPPLIERS, data.suppliers);
      if (data.workCenters) saveItem(STORAGE_KEYS.WORK_CENTERS, data.workCenters);
      if (data.salesOrders) saveItem(STORAGE_KEYS.SALES_ORDERS, data.salesOrders);
      if (data.productionOrders) saveItem(STORAGE_KEYS.PRODUCTION_ORDERS, data.productionOrders);
      return true;
    } catch (e) {
      console.error('Falha ao importar dados:', e);
      return false;
    }
  },

  resetDatabaseToDefaults(): void {
    saveItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    saveItem(STORAGE_KEYS.MATERIALS, DEFAULT_MATERIALS);
    saveItem(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    saveItem(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
    saveItem(STORAGE_KEYS.SUPPLIERS, DEFAULT_SUPPLIERS);
    saveItem(STORAGE_KEYS.WORK_CENTERS, DEFAULT_WORK_CENTERS);
    saveItem(STORAGE_KEYS.SALES_ORDERS, DEFAULT_SALES_ORDERS);
    saveItem(STORAGE_KEYS.PRODUCTION_ORDERS, DEFAULT_PRODUCTION_ORDERS);
  },
};
