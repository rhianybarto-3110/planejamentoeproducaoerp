import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { RawMaterial, UnitOfMeasure } from '../../types';
import { 
  Boxes, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  ArrowUpDown, 
  Search, 
  CheckCircle2, 
  History, 
  X,
  PackagePlus,
  PackageMinus,
  Printer
} from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';
import { PrintMaterialsReportModal } from '../reports/PrintMaterialsReportModal';

interface RawMaterialsViewProps {
  onOpenDeleteConfirm: (id: string, name: string) => void;
  adjustTargetId?: string | null;
  onClearAdjustTarget?: () => void;
}

export const RawMaterialsView: React.FC<RawMaterialsViewProps> = ({
  onOpenDeleteConfirm,
  adjustTargetId,
  onClearAdjustTarget,
}) => {
  const { rawMaterials, partners, addRawMaterial, updateRawMaterial, adjustStock, searchTerm } = useERP();

  // Print modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

  // Stock Adjust Modal states
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [materialToAdjust, setMaterialToAdjust] = useState<RawMaterial | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<'entrada' | 'saida'>('entrada');
  const [adjustReason, setAdjustReason] = useState<string>('');

  // History Drawer modal
  const [historyMaterial, setHistoryMaterial] = useState<RawMaterial | null>(null);

  // Form states for Create/Edit
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formUnit, setFormUnit] = useState<UnitOfMeasure>('un');
  const [formCurrentStock, setFormCurrentStock] = useState<number>(0);
  const [formMinStock, setFormMinStock] = useState<number>(10);
  const [formUnitCost, setFormUnitCost] = useState<number>(0);
  const [formSupplierId, setFormSupplierId] = useState<string>('');
  const [formLocation, setFormLocation] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'todos' | 'alerta' | 'ok'>('todos');

  // Trigger adjust modal if prop provided
  React.useEffect(() => {
    if (adjustTargetId) {
      const target = rawMaterials.find((m) => m.id === adjustTargetId);
      if (target) {
        setMaterialToAdjust(target);
        setAdjustDelta(10);
        setAdjustType('entrada');
        setAdjustReason('Reposição de estoque');
        setAdjustModalOpen(true);
      }
      if (onClearAdjustTarget) onClearAdjustTarget();
    }
  }, [adjustTargetId, rawMaterials, onClearAdjustTarget]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setFormName('');
    setFormCode('');
    setFormUnit('un');
    setFormCurrentStock(0);
    setFormMinStock(10);
    setFormUnitCost(0);
    setFormSupplierId('');
    setFormLocation('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (material: RawMaterial) => {
    setEditingMaterial(material);
    setFormName(material.name);
    setFormCode(material.code);
    setFormUnit(material.unit);
    setFormCurrentStock(material.currentStock);
    setFormMinStock(material.minStock);
    setFormUnitCost(material.unitCost);
    setFormSupplierId(material.supplierId || '');
    setFormLocation(material.warehouseLocation || '');
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Stock Adjust Modal
  const handleOpenAdjust = (material: RawMaterial) => {
    setMaterialToAdjust(material);
    setAdjustDelta(10);
    setAdjustType('entrada');
    setAdjustReason('Entrada manual almoxarifado');
    setAdjustModalOpen(true);
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('O nome da matéria-prima é obrigatório.');
      return;
    }
    if (formCurrentStock < 0) {
      setFormError('A quantidade em estoque não pode ser negativa.');
      return;
    }
    if (formMinStock < 0) {
      setFormError('O estoque mínimo não pode ser negativo.');
      return;
    }
    if (formUnitCost < 0) {
      setFormError('O custo unitário deve ser maior ou igual a zero.');
      return;
    }

    const supplier = partners.find((p) => p.id === formSupplierId);

    if (editingMaterial) {
      updateRawMaterial(editingMaterial.id, {
        name: formName.trim(),
        code: formCode.trim() || editingMaterial.code,
        unit: formUnit,
        currentStock: Number(formCurrentStock),
        minStock: Number(formMinStock),
        unitCost: Number(formUnitCost),
        supplierId: formSupplierId || undefined,
        supplierName: supplier ? supplier.name : undefined,
        warehouseLocation: formLocation.trim() || undefined,
      });
    } else {
      addRawMaterial({
        name: formName.trim(),
        code: formCode.trim(),
        unit: formUnit,
        currentStock: Number(formCurrentStock),
        minStock: Number(formMinStock),
        unitCost: Number(formUnitCost),
        supplierId: formSupplierId || undefined,
        supplierName: supplier ? supplier.name : undefined,
        warehouseLocation: formLocation.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const handleConfirmStockAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialToAdjust) return;

    if (adjustDelta <= 0) {
      alert('Informe uma quantidade válida maior que zero.');
      return;
    }

    const delta = adjustType === 'entrada' ? adjustDelta : -adjustDelta;

    if (adjustType === 'saida' && materialToAdjust.currentStock < adjustDelta) {
      alert(`Quantidade insuficiente em estoque. Disponível: ${materialToAdjust.currentStock} ${materialToAdjust.unit}`);
      return;
    }

    adjustStock(materialToAdjust.id, delta, adjustReason.trim());
    setAdjustModalOpen(false);
  };

  // Filter list
  const filteredMaterials = rawMaterials.filter((m) => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.supplierName && m.supplierName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'alerta') return m.currentStock <= m.minStock;
    if (statusFilter === 'ok') return m.currentStock > m.minStock;
    return true;
  });

  const suppliers = partners.filter((p) => p.type === 'fornecedor' || p.type === 'ambos');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Action and Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('todos')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              statusFilter === 'todos'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({rawMaterials.length})
          </button>
          <button
            onClick={() => setStatusFilter('alerta')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              statusFilter === 'alerta'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-700 hover:bg-amber-100/50'
            }`}
          >
            Ponto Crítico ({rawMaterials.filter((m) => m.currentStock <= m.minStock).length})
          </button>
          <button
            onClick={() => setStatusFilter('ok')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              statusFilter === 'ok'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Estoque Regular ({rawMaterials.filter((m) => m.currentStock > m.minStock).length})
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4 text-purple-700" />
            <span>Imprimir Relatório de Insumos</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Nova Matéria-Prima</span>
          </button>
        </div>
      </div>

      {/* Raw Materials Table */}
      <div className="bg-white rounded-xl border border-purple-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-purple-50/50 border-b border-purple-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Nome do Insumo / Material</th>
                <th className="py-3 px-4">Unidade</th>
                <th className="py-3 px-4 text-right">Estoque Atual</th>
                <th className="py-3 px-4 text-right">Estoque Mínimo</th>
                <th className="py-3 px-4 text-right">Custo Unitário</th>
                <th className="py-3 px-4">Fornecedor Principal</th>
                <th className="py-3 px-4">Situação</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Boxes className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-500">Nenhuma matéria-prima encontrada.</p>
                    <p className="text-xs text-slate-400 mt-1">Clique no botão acima para cadastrar novos insumos.</p>
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((mat) => {
                  const isLow = mat.currentStock <= mat.minStock;
                  return (
                    <tr key={mat.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-purple-900">
                        {mat.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{mat.name}</div>
                        {mat.warehouseLocation && (
                          <div className="text-[11px] text-slate-400">Loc: {mat.warehouseLocation}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 uppercase font-mono text-slate-500">
                        {mat.unit}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-bold tabular-nums ${
                        isLow ? 'text-rose-600' : 'text-slate-900'
                      }`}>
                        {formatNumber(mat.currentStock, 2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500 tabular-nums">
                        {formatNumber(mat.minStock, 2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-purple-950 tabular-nums">
                        {formatCurrency(mat.unitCost)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate max-w-[160px]">
                        {mat.supplierName || '-'}
                      </td>
                      <td className="py-3 px-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Abaixo do Mínimo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenAdjust(mat)}
                            title="Ajustar saldo de estoque (+ Entrada / - Saída)"
                            className="p-1.5 text-purple-700 hover:text-purple-900 hover:bg-purple-100 rounded-md transition-colors"
                          >
                            <ArrowUpDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setHistoryMaterial(mat)}
                            title="Ver histórico de movimentações"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(mat)}
                            title="Editar informações"
                            className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenDeleteConfirm(mat.id, mat.name)}
                            title="Excluir matéria-prima"
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

      {/* Modal: Cadastro / Edição de Matéria-Prima */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden">
            <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-300" />
                <span>{editingMaterial ? 'Editar Matéria-Prima' : 'Cadastrar Matéria-Prima'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-purple-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome da Matéria-Prima *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Chapa de MDF 18mm Cru"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código SKU
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="Ex: MP-008"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unidade *
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value as UnitOfMeasure)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none uppercase font-mono"
                  >
                    <option value="un">un (Unidade)</option>
                    <option value="kg">kg (Quilograma)</option>
                    <option value="g">g (Grama)</option>
                    <option value="m">m (Metro)</option>
                    <option value="cm">cm (Centímetro)</option>
                    <option value="m2">m² (Metro quadrado)</option>
                    <option value="l">l (Litro)</option>
                    <option value="ml">ml (Mililitro)</option>
                    <option value="pc">pç (Peça)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estoque Atual *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={formCurrentStock}
                    onChange={(e) => setFormCurrentStock(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estoque Mínimo *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Custo Unitário (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formUnitCost}
                    onChange={(e) => setFormUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fornecedor Homologado
                  </label>
                  <select
                    value={formSupplierId}
                    onChange={(e) => setFormSupplierId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    <option value="">Selecione um fornecedor...</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.tradingName || s.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Localização no Almoxarifado
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Ex: Prateleira B-04"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
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
                  {editingMaterial ? 'Salvar Alterações' : 'Cadastrar Matéria-Prima'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ajuste Rápido de Saldo */}
      {adjustModalOpen && materialToAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden">
            <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-amber-300" />
                <span>Ajuste de Estoque</span>
              </h3>
              <button
                onClick={() => setAdjustModalOpen(false)}
                className="text-purple-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmStockAdjust} className="p-6 space-y-4">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <div className="text-xs text-slate-500">Material Selecionado:</div>
                <div className="text-sm font-bold text-slate-900">{materialToAdjust.name}</div>
                <div className="text-xs text-purple-700 font-mono mt-0.5">
                  Saldo Atual em Almoxarifado: <strong>{materialToAdjust.currentStock} {materialToAdjust.unit}</strong>
                </div>
              </div>

              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('entrada')}
                  className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    adjustType === 'entrada'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <PackagePlus className="w-4 h-4 text-emerald-600" />
                  <span>Entrada (+ Adicionar)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('saida')}
                  className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    adjustType === 'saida'
                      ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <PackageMinus className="w-4 h-4 text-rose-600" />
                  <span>Saída (- Baixar)</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantidade a {adjustType === 'entrada' ? 'adicionar' : 'retirar'} ({materialToAdjust.unit}) *
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo da Movimentação
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Ex: Compra NF 4392 / Perda em bancada / Inventário"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
                Novo saldo projetado:{' '}
                <strong className="text-purple-900 font-mono">
                  {adjustType === 'entrada'
                    ? (materialToAdjust.currentStock + adjustDelta).toFixed(2)
                    : Math.max(0, materialToAdjust.currentStock - adjustDelta).toFixed(2)}{' '}
                  {materialToAdjust.unit}
                </strong>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors"
                >
                  Confirmar Movimentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer / Modal: Histórico de Movimentações */}
      {historyMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-300" />
                  <span>Histórico de Movimentações</span>
                </h3>
                <p className="text-xs text-purple-200 mt-0.5 font-mono">
                  {historyMaterial.code} - {historyMaterial.name}
                </p>
              </div>
              <button
                onClick={() => setHistoryMaterial(null)}
                className="text-purple-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {(!historyMaterial.movements || historyMaterial.movements.length === 0) ? (
                <p className="text-center py-8 text-xs text-slate-400">
                  Nenhuma movimentação detalhada registrada para este item.
                </p>
              ) : (
                historyMaterial.movements.map((mov) => {
                  const isPositive = mov.type === 'entrada';
                  return (
                    <div
                      key={mov.id}
                      className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {mov.type.replace('_', ' ')}
                          </span>
                          <span>{mov.reason}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Data: {formatDate(mov.date)}
                        </div>
                      </div>

                      <div className="text-right font-mono tabular-nums">
                        <span className={`font-bold ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isPositive ? '+' : '-'}{mov.quantity} {historyMaterial.unit}
                        </span>
                        <div className="text-[11px] text-slate-500">
                          Saldo pós: {mov.newStock} {historyMaterial.unit}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right shrink-0">
              <button
                onClick={() => setHistoryMaterial(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Relatório de Impressão de Matérias-Primas */}
      <PrintMaterialsReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        rawMaterials={rawMaterials}
      />
    </div>
  );
};
