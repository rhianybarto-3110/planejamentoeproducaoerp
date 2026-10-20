/**
 * PlanoRoxo ERP - Camada de Persistência Local (LocalStorage)
 * Garante persistência instantânea, funcionamento offline e compatibilidade 100% com Vercel sem necessidade de banco de dados externo ou chaves de API.
 */

import {
  Partner,
  RawMaterial,
  Product,
  CapacitySettings,
  CustomerOrder,
  ProductionOrder,
  UserAccount,
} from '../types';

const STORAGE_KEYS = {
  USER: 'planoroxo_user',
  PARTNERS: 'planoroxo_partners',
  RAW_MATERIALS: 'planoroxo_raw_materials',
  PRODUCTS: 'planoroxo_products',
  CAPACITY: 'planoroxo_capacity',
  ORDERS: 'planoroxo_orders',
  PRODUCTION_ORDERS: 'planoroxo_production_orders',
  VERSION: 'planoroxo_db_version',
};

const DB_VERSION = '1.0.0';

// Default initial user
export const DEFAULT_USER: UserAccount = {
  id: 'usr-1',
  name: 'Mariana Duarte',
  email: 'mariana.duarte@empresa.com.br',
  companyName: 'Moderna Indústria & Design',
  role: 'Diretora de Operações / PCP',
  avatarUrl: '',
};

// Initial Partners (Clientes e Fornecedores)
export const INITIAL_PARTNERS: Partner[] = [
  {
    id: 'par-1',
    name: 'AçoForte Perfis e Tubos Ltda',
    tradingName: 'AçoForte Distribuidora',
    type: 'fornecedor',
    document: '12.345.678/0001-90',
    email: 'vendas@acoforte.com.br',
    phone: '(11) 98765-4321',
    address: {
      street: 'Av. Industrial',
      number: '1250',
      neighborhood: 'Distrito Industrial',
      city: 'Guarulhos',
      state: 'SP',
      zipCode: '07140-020',
    },
    notes: 'Fornecedor homologado de tubos de aço carbono e chapas metálicas.',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'par-2',
    name: 'MadVale Painéis e Compensados S.A.',
    tradingName: 'MadVale Brasil',
    type: 'fornecedor',
    document: '98.765.432/0001-10',
    email: 'contato@madvale.com.br',
    phone: '(41) 3344-5566',
    address: {
      street: 'Rodovia dos Pinhais',
      number: '440',
      neighborhood: 'Zona Rural',
      city: 'Curitiba',
      state: 'PR',
      zipCode: '80000-000',
    },
    notes: 'Fornecedor de chapas de MDF 18mm e compensados navais.',
    createdAt: '2026-09-02T11:00:00.000Z',
    updatedAt: '2026-09-02T11:00:00.000Z',
  },
  {
    id: 'par-3',
    name: 'Studio Alfa Arquitetura & Interiores',
    tradingName: 'Studio Alfa',
    type: 'cliente',
    document: '23.456.789/0001-01',
    email: 'projetos@studioalfa.com.br',
    phone: '(11) 99123-4567',
    address: {
      street: 'Rua Oscar Freire',
      number: '890',
      complement: 'Conj. 42',
      neighborhood: 'Cerqueira César',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01426-001',
    },
    notes: 'Cliente corporativo recorrente para mobiliário de escritórios boutique.',
    createdAt: '2026-09-05T14:30:00.000Z',
    updatedAt: '2026-09-05T14:30:00.000Z',
  },
  {
    id: 'par-4',
    name: 'TechHub Espaços Compartilhados Ltda',
    tradingName: 'TechHub Coworking',
    type: 'cliente',
    document: '34.567.890/0001-22',
    email: 'compras@techhub.com.br',
    phone: '(19) 3211-9988',
    address: {
      street: 'Av. Barão de Itapura',
      number: '2100',
      neighborhood: 'Guanabara',
      city: 'Campinas',
      state: 'SP',
      zipCode: '13020-432',
    },
    notes: 'Rede de coworking com novos lançamentos semestrais.',
    createdAt: '2026-09-10T09:15:00.000Z',
    updatedAt: '2026-09-10T09:15:00.000Z',
  },
  {
    id: 'par-5',
    name: 'FixaTudo Parafusos e Fixadores ME',
    tradingName: 'FixaTudo Ferragens',
    type: 'ambos',
    document: '45.678.901/0001-33',
    email: 'vendas@fixatudo.com.br',
    phone: '(11) 2233-4455',
    address: {
      street: 'Rua Florêncio de Abreu',
      number: '315',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01030-001',
    },
    notes: 'Fornece parafusos especiais e também adquire peças usinadas sob demanda.',
    createdAt: '2026-09-12T16:00:00.000Z',
    updatedAt: '2026-09-12T16:00:00.000Z',
  },
];

// Initial Raw Materials (Matérias-Primas)
export const INITIAL_RAW_MATERIALS: RawMaterial[] = [
  {
    id: 'mp-1',
    code: 'MP-001',
    name: 'Tubo de Aço Carbono Quadrado 20x20mm',
    unit: 'm',
    currentStock: 140,
    minStock: 50,
    unitCost: 18.5,
    supplierId: 'par-1',
    supplierName: 'AçoForte Perfis e Tubos Ltda',
    warehouseLocation: 'Prateleira A-02',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'mp-2',
    code: 'MP-002',
    name: 'Chapa de MDF Carvalho Natural 18mm (2,75 x 1,83m)',
    unit: 'm2',
    currentStock: 25,
    minStock: 15,
    unitCost: 65.0,
    supplierId: 'par-2',
    supplierName: 'MadVale Painéis e Compensados S.A.',
    warehouseLocation: 'Palete Madeira B-01',
    createdAt: '2026-09-02T11:00:00.000Z',
    updatedAt: '2026-09-02T11:00:00.000Z',
  },
  {
    id: 'mp-3',
    code: 'MP-003',
    name: 'Espuma Ortopédica Alta Densidade D33',
    unit: 'm2',
    currentStock: 18,
    minStock: 20, // Critical / Alert
    unitCost: 42.0,
    supplierId: 'par-2',
    supplierName: 'MadVale Painéis e Compensados S.A.',
    warehouseLocation: 'Setor Tapeçaria T-01',
    createdAt: '2026-09-03T09:00:00.000Z',
    updatedAt: '2026-09-03T09:00:00.000Z',
  },
  {
    id: 'mp-4',
    code: 'MP-004',
    name: 'Tecido Linho Sintético Cinza Grafite',
    unit: 'm',
    currentStock: 45,
    minStock: 25,
    unitCost: 35.0,
    warehouseLocation: 'Rolo R-04',
    createdAt: '2026-09-04T14:00:00.000Z',
    updatedAt: '2026-09-04T14:00:00.000Z',
  },
  {
    id: 'mp-5',
    code: 'MP-005',
    name: 'Parafuso Estrutural Allen M6x40 com Porca',
    unit: 'un',
    currentStock: 620,
    minStock: 200,
    unitCost: 1.2,
    supplierId: 'par-5',
    supplierName: 'FixaTudo Parafusos e Fixadores ME',
    warehouseLocation: 'Gaveteiro G-12',
    createdAt: '2026-09-05T10:00:00.000Z',
    updatedAt: '2026-09-05T10:00:00.000Z',
  },
  {
    id: 'mp-6',
    code: 'MP-006',
    name: 'Pintura Eletrostática a Pó Preto Fosco',
    unit: 'kg',
    currentStock: 8,
    minStock: 12, // Critical / Alert
    unitCost: 28.0,
    warehouseLocation: 'Armário Químico Q-02',
    createdAt: '2026-09-06T15:00:00.000Z',
    updatedAt: '2026-09-06T15:00:00.000Z',
  },
  {
    id: 'mp-7',
    code: 'MP-007',
    name: 'Sapatilha Niveladora Emborrachada Rosca M8',
    unit: 'un',
    currentStock: 180,
    minStock: 80,
    unitCost: 3.5,
    supplierId: 'par-5',
    supplierName: 'FixaTudo Parafusos e Fixadores ME',
    warehouseLocation: 'Gaveteiro G-08',
    createdAt: '2026-09-07T11:00:00.000Z',
    updatedAt: '2026-09-07T11:00:00.000Z',
  },
];

// Initial Products with Ficha Técnica (BOM)
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prd-1',
    code: 'PRD-001',
    name: 'Cadeira Ergônomica Industrial Oxford',
    category: 'Cadeiras & Assentos',
    salePrice: 480.0,
    processTimeMinutes: 75, // 1h 15m
    description: 'Cadeira ergonômica com estrutura de aço tubular, assento estofado em espuma D33 e linho sintético.',
    bom: [
      { rawMaterialId: 'mp-1', rawMaterialName: 'Tubo de Aço Carbono Quadrado 20x20mm', rawMaterialCode: 'MP-001', quantity: 3.2, unit: 'm', unitCost: 18.5 },
      { rawMaterialId: 'mp-3', rawMaterialName: 'Espuma Ortopédica Alta Densidade D33', rawMaterialCode: 'MP-003', quantity: 0.4, unit: 'm2', unitCost: 42.0 },
      { rawMaterialId: 'mp-4', rawMaterialName: 'Tecido Linho Sintético Cinza Grafite', rawMaterialCode: 'MP-004', quantity: 0.6, unit: 'm', unitCost: 35.0 },
      { rawMaterialId: 'mp-5', rawMaterialName: 'Parafuso Estrutural Allen M6x40 com Porca', rawMaterialCode: 'MP-005', quantity: 8, unit: 'un', unitCost: 1.2 },
      { rawMaterialId: 'mp-6', rawMaterialName: 'Pintura Eletrostática a Pó Preto Fosco', rawMaterialCode: 'MP-006', quantity: 0.35, unit: 'kg', unitCost: 28.0 },
      { rawMaterialId: 'mp-7', rawMaterialName: 'Sapatilha Niveladora Emborrachada Rosca M8', rawMaterialCode: 'MP-007', quantity: 4, unit: 'un', unitCost: 3.5 },
    ],
    createdAt: '2026-09-10T10:00:00.000Z',
    updatedAt: '2026-09-10T10:00:00.000Z',
  },
  {
    id: 'prd-2',
    code: 'PRD-002',
    name: 'Mesa Estilo Industrial 140x70cm Carvalho',
    category: 'Mesas & Bancadas',
    salePrice: 890.0,
    processTimeMinutes: 120, // 2h
    description: 'Mesa de trabalho com base de aço reforçado em pintura eletrostática e tampo maciço em MDF 18mm amadeirado.',
    bom: [
      { rawMaterialId: 'mp-1', rawMaterialName: 'Tubo de Aço Carbono Quadrado 20x20mm', rawMaterialCode: 'MP-001', quantity: 6.5, unit: 'm', unitCost: 18.5 },
      { rawMaterialId: 'mp-2', rawMaterialName: 'Chapa de MDF Carvalho Natural 18mm (2,75 x 1,83m)', rawMaterialCode: 'MP-002', quantity: 1.1, unit: 'm2', unitCost: 65.0 },
      { rawMaterialId: 'mp-5', rawMaterialName: 'Parafuso Estrutural Allen M6x40 com Porca', rawMaterialCode: 'MP-005', quantity: 12, unit: 'un', unitCost: 1.2 },
      { rawMaterialId: 'mp-6', rawMaterialName: 'Pintura Eletrostática a Pó Preto Fosco', rawMaterialCode: 'MP-006', quantity: 0.6, unit: 'kg', unitCost: 28.0 },
      { rawMaterialId: 'mp-7', rawMaterialName: 'Sapatilha Niveladora Emborrachada Rosca M8', rawMaterialCode: 'MP-007', quantity: 4, unit: 'un', unitCost: 3.5 },
    ],
    createdAt: '2026-09-11T11:00:00.000Z',
    updatedAt: '2026-09-11T11:00:00.000Z',
  },
  {
    id: 'prd-3',
    code: 'PRD-003',
    name: 'Estante Modular 4 Prateleiras Aço & Madeira',
    category: 'Armazenamento & Estantes',
    salePrice: 1150.0,
    processTimeMinutes: 150, // 2h 30m
    description: 'Estante vertical reforçada com 4 prateleiras em MDF carvalho e coluna de aço com travamento duplo.',
    bom: [
      { rawMaterialId: 'mp-1', rawMaterialName: 'Tubo de Aço Carbono Quadrado 20x20mm', rawMaterialCode: 'MP-001', quantity: 9.0, unit: 'm', unitCost: 18.5 },
      { rawMaterialId: 'mp-2', rawMaterialName: 'Chapa de MDF Carvalho Natural 18mm (2,75 x 1,83m)', rawMaterialCode: 'MP-002', quantity: 1.8, unit: 'm2', unitCost: 65.0 },
      { rawMaterialId: 'mp-5', rawMaterialName: 'Parafuso Estrutural Allen M6x40 com Porca', rawMaterialCode: 'MP-005', quantity: 24, unit: 'un', unitCost: 1.2 },
      { rawMaterialId: 'mp-6', rawMaterialName: 'Pintura Eletrostática a Pó Preto Fosco', rawMaterialCode: 'MP-006', quantity: 0.9, unit: 'kg', unitCost: 28.0 },
      { rawMaterialId: 'mp-7', rawMaterialName: 'Sapatilha Niveladora Emborrachada Rosca M8', rawMaterialCode: 'MP-007', quantity: 4, unit: 'un', unitCost: 3.5 },
    ],
    createdAt: '2026-09-12T14:00:00.000Z',
    updatedAt: '2026-09-12T14:00:00.000Z',
  },
];

// Initial Capacity Settings
export const INITIAL_CAPACITY: CapacitySettings = {
  hoursPerDay: 8,
  daysPerWeek: 5,
  activeOperators: 4,
  efficiencyPercent: 85,
  factoryName: 'Planta Principal - Fábrica Moderna',
};

// Initial Orders (Pedidos de Clientes)
export const INITIAL_ORDERS: CustomerOrder[] = [
  {
    id: 'ord-1',
    code: 'PED-2026-001',
    customerId: 'par-3',
    customerName: 'Studio Alfa Arquitetura & Interiores',
    orderDate: '2026-10-10',
    deliveryDeadline: '2026-10-24',
    items: [
      {
        productId: 'prd-1',
        productCode: 'PRD-001',
        productName: 'Cadeira Ergônomica Industrial Oxford',
        quantity: 10,
        unitPrice: 480.0,
        total: 4800.0,
      },
      {
        productId: 'prd-2',
        productCode: 'PRD-002',
        productName: 'Mesa Estilo Industrial 140x70cm Carvalho',
        quantity: 4,
        unitPrice: 890.0,
        total: 3560.0,
      },
    ],
    totalAmount: 8360.0,
    status: 'em_producao',
    notes: 'Entregar no endereço do showroom em Pinheiros.',
    linkedOpIds: ['op-1', 'op-2'],
    createdAt: '2026-10-10T10:00:00.000Z',
    updatedAt: '2026-10-10T10:00:00.000Z',
  },
  {
    id: 'ord-2',
    code: 'PED-2026-002',
    customerId: 'par-4',
    customerName: 'TechHub Espaços Compartilhados Ltda',
    orderDate: '2026-10-12',
    deliveryDeadline: '2026-10-30',
    items: [
      {
        productId: 'prd-1',
        productCode: 'PRD-001',
        productName: 'Cadeira Ergônomica Industrial Oxford',
        quantity: 15,
        unitPrice: 480.0,
        total: 7200.0,
      },
      {
        productId: 'prd-3',
        productCode: 'PRD-003',
        productName: 'Estante Modular 4 Prateleiras Aço & Madeira',
        quantity: 3,
        unitPrice: 1150.0,
        total: 3450.0,
      },
    ],
    totalAmount: 10650.0,
    status: 'confirmado',
    notes: 'Primeira fase de ampliação do andar 3.',
    linkedOpIds: ['op-3'],
    createdAt: '2026-10-12T14:30:00.000Z',
    updatedAt: '2026-10-12T14:30:00.000Z',
  },
  {
    id: 'ord-3',
    code: 'PED-2026-003',
    customerId: 'par-3',
    customerName: 'Studio Alfa Arquitetura & Interiores',
    orderDate: '2026-10-14',
    deliveryDeadline: '2026-11-05',
    items: [
      {
        productId: 'prd-2',
        productCode: 'PRD-002',
        productName: 'Mesa Estilo Industrial 140x70cm Carvalho',
        quantity: 6,
        unitPrice: 890.0,
        total: 5340.0,
      },
    ],
    totalAmount: 5340.0,
    status: 'pendente',
    notes: 'Aguardando confirmação de pagamento do sinal.',
    linkedOpIds: [],
    createdAt: '2026-10-14T09:00:00.000Z',
    updatedAt: '2026-10-14T09:00:00.000Z',
  },
];

// Initial Production Orders (Ordens de Produção)
export const INITIAL_PRODUCTION_ORDERS: ProductionOrder[] = [
  {
    id: 'op-1',
    code: 'OP-2026-001',
    orderId: 'ord-1',
    orderCode: 'PED-2026-001',
    productId: 'prd-1',
    productCode: 'PRD-001',
    productName: 'Cadeira Ergônomica Industrial Oxford',
    quantity: 10,
    priority: 'alta',
    startDate: '2026-10-11',
    estimatedCompletionDate: '2026-10-17',
    totalRequiredMinutes: 750, // 10 units * 75m
    status: 'em_producao',
    currentStage: 'montagem',
    stockDeducted: true,
    notes: 'Corte e solda finalizados. Em montagem da tapeçaria.',
    createdAt: '2026-10-11T08:30:00.000Z',
    updatedAt: '2026-10-11T08:30:00.000Z',
  },
  {
    id: 'op-2',
    code: 'OP-2026-002',
    orderId: 'ord-1',
    orderCode: 'PED-2026-001',
    productId: 'prd-2',
    productCode: 'PRD-002',
    productName: 'Mesa Estilo Industrial 140x70cm Carvalho',
    quantity: 4,
    priority: 'normal',
    startDate: '2026-10-12',
    estimatedCompletionDate: '2026-10-18',
    totalRequiredMinutes: 480, // 4 units * 120m
    status: 'em_producao',
    currentStage: 'corte_usinagem',
    stockDeducted: true,
    notes: 'MDF em corte na esquadrejadeira.',
    createdAt: '2026-10-12T09:00:00.000Z',
    updatedAt: '2026-10-12T09:00:00.000Z',
  },
  {
    id: 'op-3',
    code: 'OP-2026-003',
    orderId: 'ord-2',
    orderCode: 'PED-2026-002',
    productId: 'prd-1',
    productCode: 'PRD-001',
    productName: 'Cadeira Ergônomica Industrial Oxford',
    quantity: 15,
    priority: 'urgente',
    startDate: '2026-10-16',
    estimatedCompletionDate: '2026-10-23',
    totalRequiredMinutes: 1125, // 15 units * 75m
    status: 'pendente',
    currentStage: 'preparacao',
    stockDeducted: false,
    notes: 'Liberar após recebimento do lote de espuma D33.',
    createdAt: '2026-10-13T15:00:00.000Z',
    updatedAt: '2026-10-13T15:00:00.000Z',
  },
];

// Generic LocalStorage helpers with type safety and fallback
export const storageService = {
  getUser(): UserAccount {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (!data) {
      this.setUser(DEFAULT_USER);
      return DEFAULT_USER;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_USER;
    }
  },

  setUser(user: UserAccount): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getPartners(): Partner[] {
    const data = localStorage.getItem(STORAGE_KEYS.PARTNERS);
    if (!data) {
      this.setPartners(INITIAL_PARTNERS);
      return INITIAL_PARTNERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_PARTNERS;
    }
  },

  setPartners(partners: Partner[]): void {
    localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(partners));
  },

  getRawMaterials(): RawMaterial[] {
    const data = localStorage.getItem(STORAGE_KEYS.RAW_MATERIALS);
    if (!data) {
      this.setRawMaterials(INITIAL_RAW_MATERIALS);
      return INITIAL_RAW_MATERIALS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_RAW_MATERIALS;
    }
  },

  setRawMaterials(materials: RawMaterial[]): void {
    localStorage.setItem(STORAGE_KEYS.RAW_MATERIALS, JSON.stringify(materials));
  },

  getProducts(): Product[] {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!data) {
      this.setProducts(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  setProducts(products: Product[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getCapacity(): CapacitySettings {
    const data = localStorage.getItem(STORAGE_KEYS.CAPACITY);
    if (!data) {
      this.setCapacity(INITIAL_CAPACITY);
      return INITIAL_CAPACITY;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_CAPACITY;
    }
  },

  setCapacity(capacity: CapacitySettings): void {
    localStorage.setItem(STORAGE_KEYS.CAPACITY, JSON.stringify(capacity));
  },

  getOrders(): CustomerOrder[] {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!data) {
      this.setOrders(INITIAL_ORDERS);
      return INITIAL_ORDERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_ORDERS;
    }
  },

  setOrders(orders: CustomerOrder[]): void {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  getProductionOrders(): ProductionOrder[] {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTION_ORDERS);
    if (!data) {
      this.setProductionOrders(INITIAL_PRODUCTION_ORDERS);
      return INITIAL_PRODUCTION_ORDERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_PRODUCTION_ORDERS;
    }
  },

  setProductionOrders(pos: ProductionOrder[]): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTION_ORDERS, JSON.stringify(pos));
  },

  // Export full DB as JSON string
  exportDatabaseJSON(): string {
    const backup = {
      version: DB_VERSION,
      exportedAt: new Date().toISOString(),
      user: this.getUser(),
      partners: this.getPartners(),
      rawMaterials: this.getRawMaterials(),
      products: this.getProducts(),
      capacity: this.getCapacity(),
      orders: this.getOrders(),
      productionOrders: this.getProductionOrders(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // Restore database from JSON
  importDatabaseJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.partners && Array.isArray(data.partners)) this.setPartners(data.partners);
      if (data.rawMaterials && Array.isArray(data.rawMaterials)) this.setRawMaterials(data.rawMaterials);
      if (data.products && Array.isArray(data.products)) this.setProducts(data.products);
      if (data.capacity) this.setCapacity(data.capacity);
      if (data.orders && Array.isArray(data.orders)) this.setOrders(data.orders);
      if (data.productionOrders && Array.isArray(data.productionOrders)) this.setProductionOrders(data.productionOrders);
      if (data.user) this.setUser(data.user);
      return true;
    } catch (e) {
      console.error('Failed to import database:', e);
      return false;
    }
  },

  // Reset to initial demo dataset
  resetToDefaults(): void {
    this.setUser(DEFAULT_USER);
    this.setPartners(INITIAL_PARTNERS);
    this.setRawMaterials(INITIAL_RAW_MATERIALS);
    this.setProducts(INITIAL_PRODUCTS);
    this.setCapacity(INITIAL_CAPACITY);
    this.setOrders(INITIAL_ORDERS);
    this.setProductionOrders(INITIAL_PRODUCTION_ORDERS);
    localStorage.setItem(STORAGE_KEYS.VERSION, DB_VERSION);
  },
};
