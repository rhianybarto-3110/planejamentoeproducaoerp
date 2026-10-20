import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  ProductionOrder, 
  ProductionOrderStatus, 
  ProductionStage, 
  PriorityLevel 
} from '../../types';
import { 
  Factory, 
  Plus, 
  Edit2, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Boxes, 
  Calendar, 
  X, 
  Eye,
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { formatDate, formatTimeMinutes } from '../../utils/formatters';
import { 
  calculateLeadTimeDate, 
  checkStockSufficiency 
} from '../../utils/productionCalculations';

interface ProductionOrdersViewProps {
  onOpenDeleteConfirm: (id: string, code: string) => void;
}

export const ProductionOrdersView: React.FC<ProductionOrdersViewProps> = ({ onOpenDeleteConfirm }) => {
  const { 
    productionOrders, 
    products, 
    rawMaterials, 
    capacity, 
    addProductionOrder, 
    updateProductionOrder, 
    advanceOpStage, 
    deductStockForProductionOrder, 
    searchTerm 
  } = useERP();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOp, setEditingOp] = useState<ProductionOrder | null>(null);

  // Stock check / deduction modal state
  const [stockCheckOp, setStockCheckOp] = useState<ProductionOrder | null>(null);

  // Detail view state
  const [viewingOp, setViewingOp] = useState<ProductionOrder | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'todos' | ProductionOrderStatus>('todos');

  // Form states
  const [formProductId, setFormProductId] = useState('');
  const [formQuantity, setFormQuantity] = useState<number>(5);
  const [formPriority, setFormPriority] = useState<PriorityLevel>('normal');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  const stageLabels: Record<ProductionStage, string> = {
    preparacao: '1. Preparação',
    corte_usinagem: '2. Corte / Usinagem',
    montagem: '3. Montagem',
    acabamento: '4. Acabamento',
    qualidade: '5. Controle de Qualidade',
    concluido: '6. Concluído',
  };

  const stagesList: ProductionStage[] = [
    'preparacao',
    'corte_usinagem',
    'montagem',
    'acabamento',
    'qualidade',
    'concluido',
  ];

  const handleOpenAdd = () => {
    setEditingOp(null);
    setFormProductId(products[0]?.id || '');
    setFormQuantity(5);
    setFormPriority('normal');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (op: ProductionOrder) => {
    setEditingOp(op);
    setFormProductId(op.productId);
    setFormQuantity(op.quantity);
    setFormPriority(op.priority);
    setFormStartDate(op.startDate);
    setFormNotes(op.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveOp = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formProductId) {
      setFormError('Selecione o produto a ser fabricado.');
      return;
    }
    if (formQuantity <= 0) {
      setFormError('A quantidade a produzir deve ser maior que zero.');
      return;
    }

    const prod = products.find((p) => p.id === formProductId);
    if (!prod) return;

    const totalMinutes = (prod.processTimeMinutes || 60) * formQuantity;
    const estimatedDate = calculateLeadTimeDate(formStartDate, totalMinutes, capacity);

    if (editingOp) {
      updateProductionOrder(editingOp.id, {
        productId: prod.id,
        productCode: prod.code,
        productName: prod.name,
        quantity: Number(formQuantity),
        priority: formPriority,
        startDate: formStartDate,
        estimatedCompletionDate: estimatedDate,
        totalRequiredMinutes: totalMinutes,
        notes: formNotes.trim() || undefined,
      });
    } else {
      addProductionOrder({
        productId: prod.id,
        productCode: prod.code,
        productName: prod.name,
        quantity: Number(formQuantity),
        priority: formPriority,
        startDate: formStartDate,
        estimatedCompletionDate: estimatedDate,
        totalRequiredMinutes: totalMinutes,
        status: 'pendente',
        currentStage: 'preparacao',
        stockDeducted: false,
        notes: formNotes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  // Filter list
  const filteredOps = productionOrders.filter((op) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      op.code.toLowerCase().includes(term) ||
      op.productName.toLowerCase().includes(term) ||
      (op.orderCode && op.orderCode.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (statusFilter !== 'todos') {
      return op.status === statusFilter;
    }

    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Filter and Actions */}
      <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('todos')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'todos'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({productionOrders.length})
          </button>
          <button
            onClick={() => setStatusFilter('em_producao')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'em_producao'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-purple-700 hover:bg-purple-100/50'
            }`}
          >
            Em Produção ({productionOrders.filter((o) => o.status === 'em_producao').length})
          </button>
          <button
            onClick={() => setStatusFilter('pendente')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'pendente'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-800 hover:bg-amber-100/50'
            }`}
          >
            Pendentes ({productionOrders.filter((o) => o.status === 'pendente').length})
          </button>
          <button
            onClick={() => setStatusFilter('concluida')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'concluida'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-100/50'
            }`}
          >
            Concluídas ({productionOrders.filter((o) => o.status === 'concluida').length})
          </button>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Emitir Nova OP</span>
        </button>
      </div>

      {/* Production Orders Table */}
      <div className="bg-white rounded-xl border border-purple-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-purple-50/50 border-b border-purple-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Código OP</th>
                <th className="py-3 px-4">Produto & Quantidade</th>
                <th className="py-3 px-4">Prioridade</th>
                <th className="py-3 px-4">Data Início</th>
                <th className="py-3 px-4">Prazo Calculado</th>
                <th className="py-3 px-4">Estágio no Chão de Fábrica</th>
                <th className="py-3 px-4 text-center">Insumos / Baixa</th>
                <th className="py-3 px-4 text-center">Avanço</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOps.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Factory className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-500">Nenhuma ordem de produção nesta lista.</p>
                    <p className="text-xs text-slate-400 mt-1">Gere ordens a partir de pedidos de venda ou crie diretamente.</p>
                  </td>
                </tr>
              ) : (
                filteredOps.map((op) => {
                  const isFinished = op.status === 'concluida';
                  const stageIndex = stagesList.indexOf(op.currentStage);
                  const progressPct = Math.round(((stageIndex + 1) / stagesList.length) * 100);

                  return (
                    <tr key={op.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-purple-900">
                        <div>{op.code}</div>
                        {op.orderCode && (
                          <div className="text-[10px] text-slate-400">Origem: {op.orderCode}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{op.productName}</div>
                        <div className="text-[11px] text-slate-500">
                          Lote: <strong className="text-purple-900 font-mono">{op.quantity} unidades</strong> ({formatTimeMinutes(op.totalRequiredMinutes)})
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          op.priority === 'urgente'
                            ? 'bg-rose-100 text-rose-800'
                            : op.priority === 'alta'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {op.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {formatDate(op.startDate)}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-purple-950">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-purple-600" />
                          <span>{formatDate(op.estimatedCompletionDate)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 min-w-[170px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-semibold text-purple-900">
                            {stageLabels[op.currentStage] || op.currentStage}
                          </span>
                          <span className="text-slate-400 text-[10px] tabular-nums font-mono">
                            {progressPct}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isFinished ? 'bg-emerald-500' : 'bg-purple-600'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {op.stockDeducted ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Baixado
                          </span>
                        ) : (
                          <button
                            onClick={() => setStockCheckOp(op)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 rounded-md transition-colors"
                          >
                            <Boxes className="w-3 h-3 text-purple-700" />
                            <span>Verificar Insumos</span>
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {!isFinished ? (
                          <button
                            onClick={() => advanceOpStage(op.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-purple-800 bg-white border border-purple-200 hover:bg-purple-50 rounded-md shadow-2xs transition-colors inline-flex items-center gap-1"
                          >
                            <span>Avançar</span>
                            <ChevronRight className="w-3 h-3 text-purple-600" />
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-700">
                            Finalizada
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingOp(op)}
                            title="Ver ficha da OP"
                            className="p-1.5 text-purple-700 hover:text-purple-900 hover:bg-purple-100 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(op)}
                            title="Editar ordem"
                            className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenDeleteConfirm(op.id, op.code)}
                            title="Excluir OP"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Nova / Editar Ordem de Produção */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden">
            <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Factory className="w-5 h-5 text-amber-300" />
                <span>{editingOp ? `Editar OP: ${editingOp.code}` : 'Emitir Nova Ordem de Produção'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-purple-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOp} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Produto Acabado *
                </label>
                <select
                  value={formProductId}
                  onChange={(e) => setFormProductId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  required
                >
                  <option value="">Selecione o produto...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name} ({formatTimeMinutes(p.processTimeMinutes)}/un)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantidade a Fabricar *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nível de Prioridade *
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none capitalize"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data de Início da Produção *
                </label>
                <input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações de Fabricação
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="Instruções para os operadores de bancada..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition-colors"
                >
                  {editingOp ? 'Salvar Alterações' : 'Emitir Ordem de Produção'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Verificação de Insumos & Baixa de Estoque */}
      {stockCheckOp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-amber-300" />
                  <span>Verificação de Insumos da OP {stockCheckOp.code}</span>
                </h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  Lote: {stockCheckOp.quantity} unidades de {stockCheckOp.productName}
                </p>
              </div>
              <button
                onClick={() => setStockCheckOp(null)}
                className="text-purple-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {(() => {
                const prod = products.find((p) => p.id === stockCheckOp.productId);
                if (!prod) return <p className="text-xs text-slate-400">Produto não localizado.</p>;
                const check = checkStockSufficiency(prod, stockCheckOp.quantity, rawMaterials);

                return (
                  <>
                    <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                      check.isSufficient
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                      <div className="shrink-0 mt-0.5">
                        {check.isSufficient ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ShieldAlert className="w-5 h-5 text-rose-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">
                          {check.isSufficient
                            ? 'Estoque 100% suficiente para fabricação deste lote'
                            : 'Estoque insuficiente no almoxarifado!'}
                        </h4>
                        <p className="text-xs mt-1 text-slate-600">
                          {check.isSufficient
                            ? 'Todos os insumos cadastrados na Ficha Técnica estão disponíveis na quantidade necessária.'
                            : `Existem ${check.missingItems.length} matéria(s)-prima(s) com saldo menor do que o necessário.`}
                        </p>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                            <th className="py-2.5 px-3">Código</th>
                            <th className="py-2.5 px-3">Insumo</th>
                            <th className="py-2.5 px-3 text-right">Qtd Necessária</th>
                            <th className="py-2.5 px-3 text-right">Estoque Atual</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {check.allRequiredItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3 font-mono font-bold text-purple-900">
                                {item.rawMaterialCode}
                              </td>
                              <td className="py-2.5 px-3 font-medium text-slate-900">
                                {item.rawMaterialName}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                                {item.required.toFixed(2)} {item.unit}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                                <span className={item.isItemSufficient ? 'text-slate-900' : 'text-rose-600 font-extrabold'}>
                                  {item.current.toFixed(2)} {item.unit}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {item.isItemSufficient ? (
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                    Disponível
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                                    Falta {(item.required - item.current).toFixed(1)} {item.unit}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        A baixa debitará automaticamente os insumos do almoxarifado.
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setStockCheckOp(null)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          Fechar
                        </button>
                        <button
                          disabled={!check.isSufficient}
                          onClick={() => {
                            deductStockForProductionOrder(stockCheckOp.id);
                            setStockCheckOp(null);
                          }}
                          className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors ${
                            check.isSufficient
                              ? 'bg-purple-700 hover:bg-purple-800 shadow-sm'
                              : 'bg-slate-300 cursor-not-allowed text-slate-500'
                          }`}
                        >
                          Confirmar Baixa de Estoque
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalhes Completos da OP */}
      {viewingOp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden">
            <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Factory className="w-5 h-5 text-amber-300" />
                  <span>Ordem de Produção: {viewingOp.code}</span>
                </h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  Item: {viewingOp.productName} ({viewingOp.quantity} un)
                </p>
              </div>
              <button
                onClick={() => setViewingOp(null)}
                className="text-purple-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-slate-500 block text-[11px]">Início da Ordem</span>
                  <strong className="text-sm font-bold text-slate-900 font-mono">{formatDate(viewingOp.startDate)}</strong>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-slate-500 block text-[11px]">Prazo Calculado</span>
                  <strong className="text-sm font-bold text-purple-900 font-mono">{formatDate(viewingOp.estimatedCompletionDate)}</strong>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                <div><strong>Estágio Atual:</strong> <span className="font-semibold text-purple-900">{stageLabels[viewingOp.currentStage]}</span></div>
                <div><strong>Status:</strong> <span className="capitalize">{viewingOp.status.replace('_', ' ')}</span></div>
                <div><strong>Insumos Baixados:</strong> {viewingOp.stockDeducted ? 'Sim (debitados do estoque)' : 'Não'}</div>
                {viewingOp.notes && <div><strong>Notas:</strong> {viewingOp.notes}</div>}
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setViewingOp(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
