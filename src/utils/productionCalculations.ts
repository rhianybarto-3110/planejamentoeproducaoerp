/**
 * PlanoRoxo ERP - Algoritmos de Cálculo da Capacidade Produtiva e Prazos de Entrega (PCP)
 */

import { CapacitySettings, Product, RawMaterial, ProductionOrder } from '../types';

export interface CapacityMetrics {
  dailyNetMinutes: number;
  dailyNetHours: number;
  weeklyNetHours: number;
  monthlyNetHours: number;
  totalActiveMinutesQueued: number;
  totalActiveHoursQueued: number;
  weeklyUtilizationPercent: number;
  status: 'tranquilo' | 'moderado' | 'alto' | 'sobrecarga';
}

/**
 * Calcula métricas gerais da capacidade da fábrica
 */
export const calculateCapacityMetrics = (
  capacity: CapacitySettings,
  activeProductionOrders: ProductionOrder[]
): CapacityMetrics => {
  const efficiency = Math.max(10, Math.min(100, capacity.efficiencyPercent)) / 100;
  // Minutos líquidos disponíveis por dia (considerando operadores e eficiência)
  const dailyNetMinutes = capacity.hoursPerDay * 60 * capacity.activeOperators * efficiency;
  const dailyNetHours = dailyNetMinutes / 60;
  const weeklyNetHours = dailyNetHours * capacity.daysPerWeek;
  const monthlyNetHours = weeklyNetHours * 4.33; // Média de semanas no mês

  // Total de minutos em fila de produção (OPs pendentes ou em_producao)
  const totalActiveMinutesQueued = activeProductionOrders
    .filter((op) => op.status === 'pendente' || op.status === 'em_producao')
    .reduce((sum, op) => sum + (op.totalRequiredMinutes || 0), 0);

  const totalActiveHoursQueued = totalActiveMinutesQueued / 60;

  // Taxa de ocupação semanal baseada na carga ativa vs capacidade semanal
  const weeklyUtilizationPercent = weeklyNetHours > 0 
    ? Math.round((totalActiveHoursQueued / weeklyNetHours) * 100)
    : 0;

  let status: 'tranquilo' | 'moderado' | 'alto' | 'sobrecarga' = 'tranquilo';
  if (weeklyUtilizationPercent > 100) status = 'sobrecarga';
  else if (weeklyUtilizationPercent > 80) status = 'alto';
  else if (weeklyUtilizationPercent > 45) status = 'moderado';

  return {
    dailyNetMinutes,
    dailyNetHours,
    weeklyNetHours,
    monthlyNetHours,
    totalActiveMinutesQueued,
    totalActiveHoursQueued,
    weeklyUtilizationPercent,
    status,
  };
};

/**
 * Calcula data estimada de conclusão da OP com base no tempo de processo,
 * capacidade diária líquida e calendário de dias úteis da empresa.
 */
export const calculateLeadTimeDate = (
  startDateStr: string,
  totalProcessMinutes: number,
  capacity: CapacitySettings,
  bufferDays: number = 0
): string => {
  if (!startDateStr) {
    const today = new Date();
    startDateStr = today.toISOString().split('T')[0];
  }

  const efficiency = Math.max(10, Math.min(100, capacity.efficiencyPercent)) / 100;
  const dailyNetMinutes = Math.max(1, capacity.hoursPerDay * 60 * capacity.activeOperators * efficiency);

  // Dias úteis necessários para produzir
  const workDaysNeeded = Math.ceil(totalProcessMinutes / dailyNetMinutes) + bufferDays;
  const totalDaysToSimulate = Math.max(1, workDaysNeeded);

  const [y, m, d] = startDateStr.split('-').map(Number);
  const current = new Date(y, m - 1, d);

  let daysAdded = 0;
  while (daysAdded < totalDaysToSimulate) {
    // 0 = Domingo, 6 = Sábado
    const dayOfWeek = current.getDay();
    const isWorkingDay = 
      capacity.daysPerWeek >= 6 
        ? dayOfWeek !== 0 
        : dayOfWeek !== 0 && dayOfWeek !== 6;

    if (isWorkingDay) {
      daysAdded++;
    }
    
    if (daysAdded < totalDaysToSimulate) {
      current.setDate(current.getDate() + 1);
    }
  }

  const resultYear = current.getFullYear();
  const resultMonth = String(current.getMonth() + 1).padStart(2, '0');
  const resultDay = String(current.getDate()).padStart(2, '0');

  return `${resultYear}-${resultMonth}-${resultDay}`;
};

/**
 * Verifica suficiência de matérias-primas no estoque para fabricar um produto
 */
export interface StockCheckResult {
  isSufficient: boolean;
  missingItems: {
    rawMaterialId: string;
    rawMaterialName: string;
    rawMaterialCode: string;
    required: number;
    current: number;
    missing: number;
    unit: string;
  }[];
  allRequiredItems: {
    rawMaterialId: string;
    rawMaterialName: string;
    rawMaterialCode: string;
    required: number;
    current: number;
    unit: string;
    isItemSufficient: boolean;
  }[];
}

export const checkStockSufficiency = (
  product: Product,
  quantityToProduce: number,
  rawMaterials: RawMaterial[]
): StockCheckResult => {
  const missingItems: StockCheckResult['missingItems'] = [];
  const allRequiredItems: StockCheckResult['allRequiredItems'] = [];

  (product.bom || []).forEach((bomItem) => {
    const rm = rawMaterials.find((m) => m.id === bomItem.rawMaterialId);
    const required = bomItem.quantity * quantityToProduce;
    const current = rm ? rm.currentStock : 0;
    const isItemSufficient = current >= required;

    allRequiredItems.push({
      rawMaterialId: bomItem.rawMaterialId,
      rawMaterialName: bomItem.rawMaterialName || (rm ? rm.name : 'Material'),
      rawMaterialCode: bomItem.rawMaterialCode || (rm ? rm.code : '-'),
      required,
      current,
      unit: bomItem.unit,
      isItemSufficient,
    });

    if (!isItemSufficient) {
      missingItems.push({
        rawMaterialId: bomItem.rawMaterialId,
        rawMaterialName: bomItem.rawMaterialName || (rm ? rm.name : 'Material'),
        rawMaterialCode: bomItem.rawMaterialCode || (rm ? rm.code : '-'),
        required,
        current,
        missing: required - current,
        unit: bomItem.unit,
      });
    }
  });

  return {
    isSufficient: missingItems.length === 0,
    missingItems,
    allRequiredItems,
  };
};

/**
 * Calcula custo de matérias-primas de um produto (soma BOM)
 */
export const calculateProductCost = (
  product: Product,
  rawMaterialsMap: Map<string, RawMaterial>
): number => {
  if (!product.bom || product.bom.length === 0) return 0;
  return product.bom.reduce((total, item) => {
    const rm = rawMaterialsMap.get(item.rawMaterialId);
    const unitCost = rm ? rm.unitCost : item.unitCost;
    return total + (item.quantity * unitCost);
  }, 0);
};
