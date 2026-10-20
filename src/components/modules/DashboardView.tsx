import React from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  ShoppingCart, 
  Factory, 
  Boxes, 
  Gauge, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  PackageCheck,
  Layers,
  Printer
} from 'lucide-react';
import { formatCurrency, formatNumber, formatDate, formatTimeMinutes } from '../../utils/formatters';
import { calculateCapacityMetrics } from '../../utils/productionCalculations';
import { ActiveModule } from '../../types';

interface DashboardViewProps {
  onNavigate: (module: ActiveModule) => void;
  onOpenCreateOrder: () => void;
  onOpenCreateOp: () => void;
  onOpenAdjustStock: (materialId: string) => void;
  onOpenPrintBom?: () => void;
  onOpenPrintMaterials?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenCreateOrder,
  onOpenCreateOp,
  onOpenAdjustStock,
  onOpenPrintBom,
  onOpenPrintMaterials,
}) => {
  const { 
    orders, 
    productionOrders, 
    rawMaterials, 
    capacity,
    products,
    advanceOpStage 
  } = useERP();

  // Metrics
  const capacityMetrics = calculateCapacityMetrics(capacity, productionOrders);

  const activeOrders = orders.filter(
    (o) => o.status === 'pendente' || o.status === 'confirmado' || o.status === 'em_producao'
  );

  const totalActiveOrdersValue = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const activeOps = productionOrders.filter(
    (op) => op.status === 'pendente' || op.status === 'em_producao'
  );

  const lowStockItems = rawMaterials.filter((m) => m.currentStock <= m.minStock);

  // Stage name formatting
  const stageLabels: Record<string, string> = {
    preparacao: 'Preparação',
    corte_usinagem: 'Corte / Usinagem',
    montagem: 'Montagem',
    acabamento: 'Acabamento',
    qualidade: 'Controle de Qualidade',
    concluido: 'Concluído',
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pedidos em Aberto */}
        <div 
          onClick={() => onNavigate('orders')}
          className="p-5 bg-white rounded-xl border border-purple-100 shadow-xs hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pedidos Ativos
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700 group-hover:bg-purple-700 group-hover:text-white transition-colors">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {activeOrders.length}
            </span>
            <span className="text-xs font-medium text-purple-700 flex items-center gap-0.5">
              <span>{formatCurrency(totalActiveOrdersValue)}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {orders.filter((o) => o.status === 'em_producao').length} em linha de produção
          </p>
        </div>

        {/* Card 2: Ordens de Produção (OPs) */}
        <div 
          onClick={() => onNavigate('production_orders')}
          className="p-5 bg-white rounded-xl border border-purple-100 shadow-xs hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ordens de Produção
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700 group-hover:bg-purple-700 group-hover:text-white transition-colors">
              <Factory className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {activeOps.length}
            </span>
            <span className="text-xs font-medium text-violet-700">
              {formatTimeMinutes(capacityMetrics.totalActiveMinutesQueued)} de trabalho
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {productionOrders.filter((op) => op.status === 'concluida').length} OPs concluídas no histórico
          </p>
        </div>

        {/* Card 3: Ocupação da Capacidade */}
        <div 
          onClick={() => onNavigate('capacity')}
          className="p-5 bg-white rounded-xl border border-purple-100 shadow-xs hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ocupação da Fábrica
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700 group-hover:bg-purple-700 group-hover:text-white transition-colors">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {capacityMetrics.weeklyUtilizationPercent}%
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
              capacityMetrics.status === 'sobrecarga'
                ? 'bg-rose-100 text-rose-800'
                : capacityMetrics.status === 'alto'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {capacityMetrics.status === 'sobrecarga' ? 'Sobrecarga' : capacityMetrics.status === 'alto' ? 'Carga Alta' : 'Equilibrada'}
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                capacityMetrics.weeklyUtilizationPercent > 100 
                  ? 'bg-rose-600' 
                  : capacityMetrics.weeklyUtilizationPercent > 75 
                  ? 'bg-amber-500' 
                  : 'bg-purple-600'
              }`}
              style={{ width: `${Math.min(100, capacityMetrics.weeklyUtilizationPercent)}%` }}
            />
          </div>
        </div>

        {/* Card 4: Estoque Crítico */}
        <div 
          onClick={() => onNavigate('raw_materials')}
          className="p-5 bg-white rounded-xl border border-purple-100 shadow-xs hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Estoque Mínimo
            </span>
            <div className={`p-2 rounded-lg transition-colors ${
              lowStockItems.length > 0 
                ? 'bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white' 
                : 'bg-purple-50 text-purple-700 group-hover:bg-purple-700 group-hover:text-white'
            }`}>
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {lowStockItems.length}
            </span>
            <span className="text-xs text-slate-500">
              de {rawMaterials.length} insumos
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {lowStockItems.length > 0 ? 'Requer reposição com fornecedor' : 'Todos os níveis acima do mínimo'}
          </p>
        </div>
      </div>

      {/* Main Content Split: Active Production Orders + Quick Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Active Production Orders Timeline */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-purple-100 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Factory className="w-4 h-4 text-purple-700" />
                Fila de Ordens de Produção em Andamento
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Acompanhe o estágio de fabricação e avance conforme a produção física
              </p>
            </div>
            <button
              onClick={onOpenCreateOp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova OP</span>
            </button>
          </div>

          {activeOps.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Nenhuma ordem de produção em andamento no momento.
            </div>
          ) : (
            <div className="space-y-3">
              {activeOps.slice(0, 5).map((op) => {
                const isUrgent = op.priority === 'urgente' || op.priority === 'alta';
                return (
                  <div
                    key={op.id}
                    className="p-3.5 rounded-xl border border-purple-50 bg-purple-50/20 hover:bg-purple-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-purple-900">
                          {op.code}
                        </span>
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {op.productName}
                        </span>
                        <span className="text-xs text-slate-500">
                          · {op.quantity} un
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isUrgent ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {op.priority.toUpperCase()}
                        </span>
                      </div>

                      <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-purple-600" />
                          Prazo Estimado: <strong className="text-slate-700">{formatDate(op.estimatedCompletionDate)}</strong>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-[11px]">
                          Fase atual: <span className="font-semibold text-purple-800">{stageLabels[op.currentStage] || op.currentStage}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => advanceOpStage(op.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-purple-800 bg-white border border-purple-200 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <span>Avançar Etapa</span>
                        <ChevronRight className="w-3.5 h-3.5 text-purple-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 text-right">
            <button
              onClick={() => onNavigate('production_orders')}
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1"
            >
              <span>Ver todas as ordens ({productionOrders.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Low Stock Alerts & Fast Shortcuts */}
        <div className="space-y-6">
          {/* Low Stock Warning Box */}
          <div className="bg-white rounded-xl border border-purple-100 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Insumos no Ponto de Pedido
              </h3>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                {lowStockItems.length} itens
              </span>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100 text-center text-xs text-emerald-800 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Nenhum insumo em nível crítico</span>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockItems.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg border border-amber-100 bg-amber-50/30 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500 tabular-nums">
                        Atual: <span className="text-rose-700 font-bold">{item.currentStock} {item.unit}</span> (Mín: {item.minStock} {item.unit})
                      </p>
                    </div>
                    <button
                      onClick={() => onOpenAdjustStock(item.id)}
                      className="px-2 py-1 text-[11px] font-semibold text-purple-700 bg-white border border-purple-200 hover:bg-purple-50 rounded-md transition-colors shrink-0 shadow-2xs"
                    >
                      + Entrada
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => onNavigate('raw_materials')}
              className="w-full mt-2 py-1.5 text-center text-xs font-semibold text-purple-700 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors"
            >
              Abrir Controle de Almoxarifado
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-gradient-to-br from-purple-900 to-indigo-950 rounded-xl p-5 text-white space-y-3 shadow-md">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Ações Rápidas de Produção
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenCreateOrder}
                className="p-3 bg-white/10 hover:bg-white/15 rounded-lg text-left transition-colors border border-white/10"
              >
                <ShoppingCart className="w-4 h-4 text-amber-300 mb-1" />
                <span className="text-xs font-semibold block">Novo Pedido</span>
                <span className="text-[10px] text-purple-200 block">Venda de cliente</span>
              </button>
              <button
                onClick={onOpenCreateOp}
                className="p-3 bg-white/10 hover:bg-white/15 rounded-lg text-left transition-colors border border-white/10"
              >
                <Factory className="w-4 h-4 text-amber-300 mb-1" />
                <span className="text-xs font-semibold block">Emitir OP</span>
                <span className="text-[10px] text-purple-200 block">Ordem de fábrica</span>
              </button>
            </div>

            <div className="pt-2 border-t border-purple-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block mb-1.5">
                Relatórios para Impressão / PDF
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onOpenPrintBom ? onOpenPrintBom() : onNavigate('products_bom')}
                  className="p-2 bg-purple-800/80 hover:bg-purple-700 text-purple-100 hover:text-white rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors border border-purple-600/40"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="truncate">Fichas Técnicas</span>
                </button>
                <button
                  onClick={() => onOpenPrintMaterials ? onOpenPrintMaterials() : onNavigate('raw_materials')}
                  className="p-2 bg-purple-800/80 hover:bg-purple-700 text-purple-100 hover:text-white rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors border border-purple-600/40"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="truncate">Relat. Insumos</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Customer Orders Section */}
      <div className="bg-white rounded-xl border border-purple-100 shadow-xs p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-purple-700" />
              Últimos Pedidos Recebidos
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pedidos de clientes aguardando produção ou entrega
            </p>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1"
          >
            <span>Ver todos os pedidos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Data do Pedido</th>
                <th className="py-2.5 px-3">Prazo Entrega</th>
                <th className="py-2.5 px-3 text-right">Valor Total</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-purple-50/20 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-purple-900">
                    {order.code}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {order.customerName}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {formatDate(order.orderDate)}
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {formatDate(order.deliveryDeadline)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                      order.status === 'em_producao'
                        ? 'bg-purple-100 text-purple-800'
                        : order.status === 'confirmado'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'pronto' || order.status === 'entregue'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
