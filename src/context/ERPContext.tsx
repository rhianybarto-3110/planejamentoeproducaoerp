/**
 * PlanoRoxo ERP - Contexto Principal da Aplicação
 * Centraliza estado e operações de negócio de todos os módulos
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Partner,
  RawMaterial,
  Product,
  CapacitySettings,
  CustomerOrder,
  ProductionOrder,
  ActiveModule,
  ProductionStage,
} from '../types';
import { storageService } from '../services/storage';
import { calculateLeadTimeDate, checkStockSufficiency } from '../utils/productionCalculations';
import { generateNextCode } from '../utils/formatters';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface ERPContextType {
  // Navigation & UI
  activeModule: ActiveModule;
  setActiveModule: (mod: ActiveModule) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  toasts: ToastItem[];
  addToast: (type: ToastItem['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;

  // Partners (Clientes & Fornecedores)
  partners: Partner[];
  addPartner: (partner: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePartner: (id: string, partner: Partial<Partner>) => void;
  deletePartner: (id: string) => boolean;

  // Raw Materials (Matérias-Primas)
  rawMaterials: RawMaterial[];
  addRawMaterial: (material: Omit<RawMaterial, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRawMaterial: (id: string, material: Partial<RawMaterial>) => void;
  deleteRawMaterial: (id: string) => boolean;
  adjustStock: (id: string, quantityDelta: number, reason: string) => void;

  // Products (Ficha Técnica / BOM)
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => boolean;

  // Capacity Settings
  capacity: CapacitySettings;
  updateCapacity: (settings: CapacitySettings) => void;

  // Customer Orders (Pedidos)
  orders: CustomerOrder[];
  addOrder: (order: Omit<CustomerOrder, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'linkedOpIds'>) => CustomerOrder;
  updateOrder: (id: string, order: Partial<CustomerOrder>) => void;
  deleteOrder: (id: string) => boolean;
  generateProductionOrdersFromOrder: (orderId: string) => boolean;

  // Production Orders (Ordens de Produção)
  productionOrders: ProductionOrder[];
  addProductionOrder: (op: Omit<ProductionOrder, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => void;
  updateProductionOrder: (id: string, op: Partial<ProductionOrder>) => void;
  deleteProductionOrder: (id: string) => boolean;
  advanceOpStage: (opId: string) => void;
  deductStockForProductionOrder: (opId: string) => boolean;

  // Data management
  resetAllData: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (json: string) => boolean;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Core Data loaded from LocalStorage
  const [partners, setPartners] = useState<Partner[]>(() => storageService.getPartners());
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(() => storageService.getRawMaterials());
  const [products, setProducts] = useState<Product[]>(() => storageService.getProducts());
  const [capacity, setCapacity] = useState<CapacitySettings>(() => storageService.getCapacity());
  const [orders, setOrders] = useState<CustomerOrder[]>(() => storageService.getOrders());
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(() => storageService.getProductionOrders());

  // Toast dispatch
  const addToast = useCallback((type: ToastItem['type'], title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save changes to storage whenever states change
  useEffect(() => {
    storageService.setPartners(partners);
  }, [partners]);

  useEffect(() => {
    storageService.setRawMaterials(rawMaterials);
  }, [rawMaterials]);

  useEffect(() => {
    storageService.setProducts(products);
  }, [products]);

  useEffect(() => {
    storageService.setCapacity(capacity);
  }, [capacity]);

  useEffect(() => {
    storageService.setOrders(orders);
  }, [orders]);

  useEffect(() => {
    storageService.setProductionOrders(productionOrders);
  }, [productionOrders]);

  // PARTNERS (Clientes e Fornecedores)
  const addPartner = (data: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPartner: Partner = {
      ...data,
      id: `par-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPartners((prev) => [newPartner, ...prev]);
    addToast('success', 'Cadastro realizado', `${newPartner.name} foi adicionado com sucesso.`);
  };

  const updatePartner = (id: string, updated: Partial<Partner>) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated, updatedAt: new Date().toISOString() } : p))
    );
    addToast('success', 'Atualizado com sucesso', 'As informações do parceiro foram salvas.');
  };

  const deletePartner = (id: string): boolean => {
    // Check if partner is used in active orders or raw materials
    const usedInOrder = orders.some((o) => o.customerId === id);
    const usedInMaterial = rawMaterials.some((m) => m.supplierId === id);

    if (usedInOrder || usedInMaterial) {
      addToast(
        'error',
        'Não foi possível excluir',
        'Este cliente/fornecedor possui vínculos ativos com pedidos ou matérias-primas.'
      );
      return false;
    }

    setPartners((prev) => prev.filter((p) => p.id !== id));
    addToast('success', 'Registro removido', 'O parceiro foi excluído com sucesso.');
    return true;
  };

  // RAW MATERIALS (Matérias-Primas)
  const addRawMaterial = (data: Omit<RawMaterial, 'id' | 'createdAt' | 'updatedAt'>) => {
    const existingCodes = rawMaterials.map((m) => m.code);
    const code = data.code || generateNextCode('MP', existingCodes);

    const newMaterial: RawMaterial = {
      ...data,
      code,
      id: `mp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      movements: [
        {
          id: `mov-${Date.now()}`,
          date: new Date().toISOString(),
          type: 'entrada',
          quantity: data.currentStock,
          previousStock: 0,
          newStock: data.currentStock,
          reason: 'Saldo inicial de estoque',
        },
      ],
    };
    setRawMaterials((prev) => [newMaterial, ...prev]);
    addToast('success', 'Matéria-prima cadastrada', `${newMaterial.name} inserida no estoque.`);
  };

  const updateRawMaterial = (id: string, updated: Partial<RawMaterial>) => {
    setRawMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updated, updatedAt: new Date().toISOString() } : m))
    );
    addToast('success', 'Matéria-prima atualizada', 'Alterações salvas com sucesso.');
  };

  const deleteRawMaterial = (id: string): boolean => {
    // Check if used in any product BOM
    const usedInProduct = products.find((p) => (p.bom || []).some((b) => b.rawMaterialId === id));
    if (usedInProduct) {
      addToast(
        'error',
        'Impossível excluir',
        `Esta matéria-prima faz parte da Ficha Técnica do produto "${usedInProduct.name}". Remova-a da ficha primeiro.`
      );
      return false;
    }
    setRawMaterials((prev) => prev.filter((m) => m.id !== id));
    addToast('success', 'Matéria-prima removida', 'Item excluído do cadastro de estoque.');
    return true;
  };

  const adjustStock = (id: string, quantityDelta: number, reason: string) => {
    setRawMaterials((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const previousStock = m.currentStock;
        const newStock = Math.max(0, previousStock + quantityDelta);
        const movType: 'entrada' | 'saida' = quantityDelta >= 0 ? 'entrada' : 'saida';

        const newMovement = {
          id: `mov-${Date.now()}`,
          date: new Date().toISOString(),
          type: movType,
          quantity: Math.abs(quantityDelta),
          previousStock,
          newStock,
          reason: reason || (quantityDelta >= 0 ? 'Ajuste manual de entrada' : 'Ajuste manual de saída'),
        };

        return {
          ...m,
          currentStock: newStock,
          movements: [newMovement, ...(m.movements || [])],
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addToast('success', 'Estoque ajustado', `Movimentação de ${quantityDelta >= 0 ? '+' : ''}${quantityDelta} registrada.`);
  };

  // PRODUCTS (Ficha Técnica / BOM)
  const addProduct = (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const existingCodes = products.map((p) => p.code);
    const code = data.code || generateNextCode('PRD', existingCodes);

    const newProduct: Product = {
      ...data,
      code,
      id: `prd-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    addToast('success', 'Produto cadastrado', `Ficha técnica de "${newProduct.name}" salva com sucesso.`);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated, updatedAt: new Date().toISOString() } : p))
    );
    addToast('success', 'Produto atualizado', 'Ficha técnica e custos atualizados.');
  };

  const deleteProduct = (id: string): boolean => {
    // Check if referenced in pending orders or production orders
    const usedInOrder = orders.some((o) =>
      o.items.some((item) => item.productId === id && o.status !== 'cancelado')
    );
    const usedInOp = productionOrders.some(
      (op) => op.productId === id && op.status !== 'concluida' && op.status !== 'cancelada'
    );

    if (usedInOrder || usedInOp) {
      addToast(
        'error',
        'Produto em uso',
        'Não é possível excluir um produto associado a pedidos ou ordens de produção em andamento.'
      );
      return false;
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast('success', 'Produto excluído', 'Produto e sua ficha técnica foram removidos.');
    return true;
  };

  // CAPACITY SETTINGS
  const updateCapacity = (settings: CapacitySettings) => {
    setCapacity(settings);
    addToast('success', 'Capacidade atualizada', 'Parâmetros de fábrica e jornada recalculados.');
  };

  // CUSTOMER ORDERS (Pedidos)
  const addOrder = (
    data: Omit<CustomerOrder, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'linkedOpIds'>
  ): CustomerOrder => {
    const existingCodes = orders.map((o) => o.code);
    const code = generateNextCode(`PED-${new Date().getFullYear()}`, existingCodes);

    const newOrder: CustomerOrder = {
      ...data,
      id: `ord-${Date.now()}`,
      code,
      linkedOpIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    addToast('success', 'Pedido criado', `Pedido ${newOrder.code} para ${newOrder.customerName} registrado.`);
    return newOrder;
  };

  const updateOrder = (id: string, updated: Partial<CustomerOrder>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updated, updatedAt: new Date().toISOString() } : o))
    );
    addToast('success', 'Pedido atualizado', 'Dados do pedido foram salvos.');
  };

  const deleteOrder = (id: string): boolean => {
    const targetOrder = orders.find((o) => o.id === id);
    if (!targetOrder) return false;

    // Check if has active OPs
    const hasActiveOps = productionOrders.some(
      (op) => op.orderId === id && op.status === 'em_producao'
    );
    if (hasActiveOps) {
      addToast(
        'error',
        'Pedido com OPs ativas',
        'Este pedido possui Ordens de Produção em andamento na fábrica. Cancele-as primeiro.'
      );
      return false;
    }

    setOrders((prev) => prev.filter((o) => o.id !== id));
    addToast('success', 'Pedido cancelado e excluído', 'O pedido foi removido da base.');
    return true;
  };

  // GENERATE PRODUCTION ORDERS FROM CUSTOMER ORDER
  const generateProductionOrdersFromOrder = (orderId: string): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    const existingOpCodes = productionOrders.map((op) => op.code);
    const newOps: ProductionOrder[] = [];
    const generatedOpIds: string[] = [];

    const todayStr = new Date().toISOString().split('T')[0];

    for (const item of order.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      const opCode = generateNextCode(
        `OP-${new Date().getFullYear()}`,
        [...existingOpCodes, ...newOps.map((o) => o.code)]
      );

      const totalMinutes = (product.processTimeMinutes || 60) * item.quantity;
      const estimatedDate = calculateLeadTimeDate(todayStr, totalMinutes, capacity);

      const opId = `op-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      generatedOpIds.push(opId);

      const newOp: ProductionOrder = {
        id: opId,
        code: opCode,
        orderId: order.id,
        orderCode: order.code,
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        quantity: item.quantity,
        priority: 'normal',
        startDate: todayStr,
        estimatedCompletionDate: estimatedDate,
        totalRequiredMinutes: totalMinutes,
        status: 'pendente',
        currentStage: 'preparacao',
        stockDeducted: false,
        notes: `Gerada automaticamente a partir do pedido ${order.code} de ${order.customerName}.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      newOps.push(newOp);
    }

    if (newOps.length === 0) {
      addToast('warning', 'Nenhum produto válido', 'Não foi possível gerar OPs para os itens deste pedido.');
      return false;
    }

    setProductionOrders((prev) => [...newOps, ...prev]);

    // Update order with linked OPs and set status to em_producao if was pendente/confirmado
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: o.status === 'pendente' ? 'em_producao' : o.status,
              linkedOpIds: Array.from(new Set([...(o.linkedOpIds || []), ...generatedOpIds])),
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    addToast(
      'success',
      'Ordens de Produção Criadas!',
        `${newOps.length} ${newOps.length === 1 ? 'Ordem' : 'Ordens'} de Produção emitida(s) para o Pedido ${order.code}.`
    );
    return true;
  };

  // PRODUCTION ORDERS (Ordens de Produção)
  const addProductionOrder = (data: Omit<ProductionOrder, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => {
    const existingCodes = productionOrders.map((o) => o.code);
    const code = generateNextCode(`OP-${new Date().getFullYear()}`, existingCodes);

    const newOp: ProductionOrder = {
      ...data,
      id: `op-${Date.now()}`,
      code,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProductionOrders((prev) => [newOp, ...prev]);
    addToast('success', 'Ordem de Produção criada', `Ordem ${newOp.code} registrada com sucesso.`);
  };

  const updateProductionOrder = (id: string, updated: Partial<ProductionOrder>) => {
    setProductionOrders((prev) =>
      prev.map((op) => (op.id === id ? { ...op, ...updated, updatedAt: new Date().toISOString() } : op))
    );
    addToast('success', 'OP Atualizada', 'Informações da ordem foram atualizadas.');
  };

  const deleteProductionOrder = (id: string): boolean => {
    setProductionOrders((prev) => prev.filter((op) => op.id !== id));
    addToast('success', 'OP Removida', 'Ordem de produção excluída com sucesso.');
    return true;
  };

  // Stage advancement in production workflow
  const STAGES_ORDER: ProductionStage[] = [
    'preparacao',
    'corte_usinagem',
    'montagem',
    'acabamento',
    'qualidade',
    'concluido',
  ];

  const advanceOpStage = (opId: string) => {
    setProductionOrders((prev) =>
      prev.map((op) => {
        if (op.id !== opId) return op;

        const currentIndex = STAGES_ORDER.indexOf(op.currentStage);
        if (currentIndex < STAGES_ORDER.length - 1) {
          const nextStage = STAGES_ORDER[currentIndex + 1];
          const isFinished = nextStage === 'concluido';

          return {
            ...op,
            currentStage: nextStage,
            status: isFinished ? 'concluida' : 'em_producao',
            actualCompletionDate: isFinished ? new Date().toISOString().split('T')[0] : op.actualCompletionDate,
            updatedAt: new Date().toISOString(),
          };
        }
        return op;
      })
    );
    addToast('info', 'Etapa avançada', 'Progresso da ordem atualizado no chão de fábrica.');
  };

  // Deduct Raw Materials Stock for Production Order
  const deductStockForProductionOrder = (opId: string): boolean => {
    const op = productionOrders.find((o) => o.id === opId);
    if (!op) return false;

    if (op.stockDeducted) {
      addToast('warning', 'Estoque já baixado', 'As matérias-primas desta OP já foram descontadas anteriormente.');
      return false;
    }

    const product = products.find((p) => p.id === op.productId);
    if (!product || !product.bom || product.bom.length === 0) {
      addToast('error', 'Ficha Técnica ausente', 'O produto não possui ficha técnica cadastrada para baixa de estoque.');
      return false;
    }

    // Check availability
    const check = checkStockSufficiency(product, op.quantity, rawMaterials);
    if (!check.isSufficient) {
      const missingNames = check.missingItems.map((m) => `${m.rawMaterialName} (falta ${m.missing.toFixed(1)} ${m.unit})`).join(', ');
      addToast(
        'error',
        'Estoque insuficiente!',
        `Não há materiais suficientes: ${missingNames}. Ajuste ou dê entrada no estoque.`
      );
      return false;
    }

    // Deduct each material from raw materials
    setRawMaterials((prev) =>
      prev.map((material) => {
        const bomItem = product.bom.find((b) => b.rawMaterialId === material.id);
        if (!bomItem) return material;

        const needed = bomItem.quantity * op.quantity;
        const previousStock = material.currentStock;
        const newStock = Math.max(0, previousStock - needed);

        const newMov = {
          id: `mov-${Date.now()}-${material.id}`,
          date: new Date().toISOString(),
          type: 'consumo_op' as const,
          quantity: needed,
          previousStock,
          newStock,
          referenceOpId: op.code,
          reason: `Consumo para fabricação da OP ${op.code} (${op.quantity} un de ${product.name})`,
        };

        return {
          ...material,
          currentStock: newStock,
          movements: [newMov, ...(material.movements || [])],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    // Mark OP as stock deducted and move to em_producao if still pendente
    setProductionOrders((prev) =>
      prev.map((o) =>
        o.id === opId
          ? {
              ...o,
              stockDeducted: true,
              status: o.status === 'pendente' ? 'em_producao' : o.status,
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    addToast(
      'success',
      'Baixa de estoque efetuada com sucesso!',
      `Os insumos para fabricar ${op.quantity} un de ${product.name} foram debitados do almoxarifado.`
    );
    return true;
  };

  // SYSTEM DATA MANAGEMENT
  const resetAllData = () => {
    storageService.resetToDefaults();
    setPartners(storageService.getPartners());
    setRawMaterials(storageService.getRawMaterials());
    setProducts(storageService.getProducts());
    setCapacity(storageService.getCapacity());
    setOrders(storageService.getOrders());
    setProductionOrders(storageService.getProductionOrders());
    addToast('info', 'Dados restaurados', 'O banco de dados foi resetado para os dados padrão de demonstração.');
  };

  const exportDatabaseJSON = () => {
    return storageService.exportDatabaseJSON();
  };

  const importDatabaseJSON = (json: string): boolean => {
    const success = storageService.importDatabaseJSON(json);
    if (success) {
      setPartners(storageService.getPartners());
      setRawMaterials(storageService.getRawMaterials());
      setProducts(storageService.getProducts());
      setCapacity(storageService.getCapacity());
      setOrders(storageService.getOrders());
      setProductionOrders(storageService.getProductionOrders());
      addToast('success', 'Backup restaurado com sucesso!', 'Todos os registros foram importados.');
      return true;
    } else {
      addToast('error', 'Falha na importação', 'O arquivo JSON selecionado é inválido ou está corrompido.');
      return false;
    }
  };

  return (
    <ERPContext.Provider
      value={{
        activeModule,
        setActiveModule,
        searchTerm,
        setSearchTerm,
        toasts,
        addToast,
        removeToast,
        partners,
        addPartner,
        updatePartner,
        deletePartner,
        rawMaterials,
        addRawMaterial,
        updateRawMaterial,
        deleteRawMaterial,
        adjustStock,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        capacity,
        updateCapacity,
        orders,
        addOrder,
        updateOrder,
        deleteOrder,
        generateProductionOrdersFromOrder,
        productionOrders,
        addProductionOrder,
        updateProductionOrder,
        deleteProductionOrder,
        advanceOpStage,
        deductStockForProductionOrder,
        resetAllData,
        exportDatabaseJSON,
        importDatabaseJSON,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = (): ERPContextType => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP deve ser utilizado dentro de um ERPProvider');
  }
  return context;
};
