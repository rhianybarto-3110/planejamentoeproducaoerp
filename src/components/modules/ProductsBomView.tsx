import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Product, BomItem, UnitOfMeasure } from '../../types';
import { 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  X, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Eye,
  Info,
  Printer
} from 'lucide-react';
import { formatCurrency, formatNumber, formatTimeMinutes } from '../../utils/formatters';
import { PrintBomReportModal } from '../reports/PrintBomReportModal';

interface ProductsBomViewProps {
  onOpenDeleteConfirm: (id: string, name: string) => void;
}

export const ProductsBomView: React.FC<ProductsBomViewProps> = ({ onOpenDeleteConfirm }) => {
  const { products, rawMaterials, addProduct, updateProduct, searchTerm } = useERP();

  // Print modal states
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printTargetProductId, setPrintTargetProductId] = useState<string | undefined>(undefined);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Detail Drawer state
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formSalePrice, setFormSalePrice] = useState<number>(0);
  const [formProcessMinutes, setFormProcessMinutes] = useState<number>(60);
  const [formDescription, setFormDescription] = useState('');
  const [formBom, setFormBom] = useState<BomItem[]>([]);
  const [formError, setFormError] = useState('');

  // BOM Builder temporary inputs
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  // Open Create Modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCode('');
    setFormCategory('Mobiliário & Estruturas');
    setFormSalePrice(0);
    setFormProcessMinutes(60);
    setFormDescription('');
    setFormBom([]);
    setFormError('');
    setSelectedMaterialId('');
    setSelectedQuantity(1);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormCode(product.code);
    setFormCategory(product.category);
    setFormSalePrice(product.salePrice);
    setFormProcessMinutes(product.processTimeMinutes);
    setFormDescription(product.description || '');
    setFormBom(product.bom ? [...product.bom] : []);
    setFormError('');
    setSelectedMaterialId('');
    setSelectedQuantity(1);
    setIsModalOpen(true);
  };

  // Add Item to BOM
  const handleAddBomItem = () => {
    if (!selectedMaterialId) {
      alert('Selecione uma matéria-prima para adicionar à composição.');
      return;
    }
    if (selectedQuantity <= 0) {
      alert('Informe uma quantidade necessária maior que zero.');
      return;
    }

    const material = rawMaterials.find((m) => m.id === selectedMaterialId);
    if (!material) return;

    // Check if already in BOM
    const existsIndex = formBom.findIndex((b) => b.rawMaterialId === selectedMaterialId);
    if (existsIndex >= 0) {
      // Update quantity
      const updated = [...formBom];
      updated[existsIndex].quantity += selectedQuantity;
      setFormBom(updated);
    } else {
      const newItem: BomItem = {
        rawMaterialId: material.id,
        rawMaterialName: material.name,
        rawMaterialCode: material.code,
        quantity: selectedQuantity,
        unit: material.unit,
        unitCost: material.unitCost,
      };
      setFormBom([...formBom, newItem]);
    }

    setSelectedMaterialId('');
    setSelectedQuantity(1);
  };

  // Remove Item from BOM
  const handleRemoveBomItem = (index: number) => {
    setFormBom(formBom.filter((_, i) => i !== index));
  };

  // Calculate live costs
  const calculateBomTotalCost = (bomItems: BomItem[]) => {
    return bomItems.reduce((acc, item) => {
      const rm = rawMaterials.find((m) => m.id === item.rawMaterialId);
      const cost = rm ? rm.unitCost : item.unitCost;
      return acc + (item.quantity * cost);
    }, 0);
  };

  const calculatedCost = calculateBomTotalCost(formBom);
  const calculatedMarginVal = formSalePrice - calculatedCost;
  const calculatedMarginPct = formSalePrice > 0 ? (calculatedMarginVal / formSalePrice) * 100 : 0;

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('O nome do produto é obrigatório.');
      return;
    }
    if (formSalePrice <= 0) {
      setFormError('Informe um preço de venda válido maior que zero.');
      return;
    }
    if (formProcessMinutes <= 0) {
      setFormError('O tempo de processo unitário deve ser de pelo menos 1 minuto.');
      return;
    }
    if (formBom.length === 0) {
      setFormError('Adicione pelo menos uma matéria-prima na Ficha Técnica (BOM).');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formName.trim(),
        code: formCode.trim() || editingProduct.code,
        category: formCategory.trim() || 'Geral',
        salePrice: Number(formSalePrice),
        processTimeMinutes: Number(formProcessMinutes),
        description: formDescription.trim(),
        bom: formBom,
      });
    } else {
      addProduct({
        name: formName.trim(),
        code: formCode.trim(),
        category: formCategory.trim() || 'Geral',
        salePrice: Number(formSalePrice),
        processTimeMinutes: Number(formProcessMinutes),
        description: formDescription.trim(),
        bom: formBom,
      });
    }

    setIsModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.code.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Action */}
      <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Catálogo de Produtos e Fichas Técnicas (BOM)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastre os produtos acabados com suas receitas de matérias-primas e tempos operacionais de fabricação.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setPrintTargetProductId(undefined);
              setPrintModalOpen(true);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4 text-purple-700" />
            <span>Imprimir Fichas (BOM)</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Produto</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-purple-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-purple-50/50 border-b border-purple-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Nome do Produto</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Tempo de Processo</th>
                <th className="py-3 px-4 text-right">Insumos na Ficha</th>
                <th className="py-3 px-4 text-right">Custo Insumos (BOM)</th>
                <th className="py-3 px-4 text-right">Preço de Venda</th>
                <th className="py-3 px-4 text-right">Margem Bruta</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-500">Nenhum produto cadastrado.</p>
                    <p className="text-xs text-slate-400 mt-1">Crie seu primeiro produto clicando no botão acima.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const cost = calculateBomTotalCost(prod.bom || []);
                  const marginVal = prod.salePrice - cost;
                  const marginPct = prod.salePrice > 0 ? (marginVal / prod.salePrice) * 100 : 0;

                  return (
                    <tr key={prod.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-purple-900">
                        {prod.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{prod.name}</div>
                        {prod.description && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{prod.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                          {prod.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-purple-900">
                        <span className="inline-flex items-center gap-1 text-slate-700">
                          <Clock className="w-3 h-3 text-purple-600" />
                          {formatTimeMinutes(prod.processTimeMinutes)}/un
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {(prod.bom || []).length} itens
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-700 tabular-nums">
                        {formatCurrency(cost)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-purple-950 tabular-nums">
                        {formatCurrency(prod.salePrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        <span className={`font-semibold ${marginPct >= 35 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {marginPct.toFixed(1)}% ({formatCurrency(marginVal)})
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setPrintTargetProductId(prod.id);
                              setPrintModalOpen(true);
                            }}
                            title="Imprimir esta Ficha Técnica"
                            className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setViewProduct(prod)}
                            title="Ver detalhes da Ficha Técnica (BOM)"
                            className="p-1.5 text-purple-700 hover:text-purple-900 hover:bg-purple-100 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            title="Editar produto e composição"
                            className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenDeleteConfirm(prod.id, prod.name)}
                            title="Excluir produto"
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

      {/* Modal: Cadastro / Edição do Produto e Ficha Técnica */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
            <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-300" />
                <span>{editingProduct ? 'Editar Ficha Técnica do Produto' : 'Nova Ficha Técnica do Produto (BOM)'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-purple-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-5 flex-1">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Informações Básicas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Comercial do Produto *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Cadeira Industrial Oxford"
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
                    placeholder="Ex: PRD-004"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria *
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Ex: Cadeiras & Assentos"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preço de Venda (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formSalePrice}
                    onChange={(e) => setFormSalePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tempo de Processo (min/un) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={formProcessMinutes}
                    onChange={(e) => setFormProcessMinutes(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Equivale a {formatTimeMinutes(formProcessMinutes)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição Técnica ou Especificações
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="Dimensões, acabamento e instruções de fabricação..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              {/* Seção Ficha Técnica (BOM) Builder */}
              <div className="pt-2 border-t border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-purple-700" />
                    Composição de Matérias-Primas (BOM)
                  </h4>
                  <span className="text-xs text-slate-500">
                    {formBom.length} {formBom.length === 1 ? 'insumo' : 'insumos'} adicionados
                  </span>
                </div>

                {/* Inserir Insumo */}
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex flex-col sm:flex-row items-end gap-2 mb-3">
                  <div className="flex-1 w-full">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Selecionar Matéria-Prima
                    </label>
                    <select
                      value={selectedMaterialId}
                      onChange={(e) => setSelectedMaterialId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    >
                      <option value="">Escolha um insumo do almoxarifado...</option>
                      {rawMaterials.map((rm) => (
                        <option key={rm.id} value={rm.id}>
                          {rm.code} - {rm.name} ({formatCurrency(rm.unitCost)} / {rm.unit}) [Estoque: {rm.currentStock} {rm.unit}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full sm:w-36">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Quantidade Necessária
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      value={selectedQuantity}
                      onChange={(e) => setSelectedQuantity(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddBomItem}
                    className="w-full sm:w-auto px-4 py-1.5 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-xs transition-colors shrink-0"
                  >
                    + Adicionar à Ficha
                  </button>
                </div>

                {/* Tabela de Insumos da Ficha */}
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-2 px-3">Código</th>
                        <th className="py-2 px-3">Matéria-Prima</th>
                        <th className="py-2 px-3 text-right">Qtd. Necessária</th>
                        <th className="py-2 px-3 text-right">Custo Unitário</th>
                        <th className="py-2 px-3 text-right">Subtotal</th>
                        <th className="py-2 px-3 text-center">Remover</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {formBom.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-xs text-slate-400">
                            Nenhuma matéria-prima vinculada ainda. Selecione acima para compor este produto.
                          </td>
                        </tr>
                      ) : (
                        formBom.map((item, idx) => {
                          const rm = rawMaterials.find((m) => m.id === item.rawMaterialId);
                          const unitCost = rm ? rm.unitCost : item.unitCost;
                          const subtotal = item.quantity * unitCost;

                          return (
                            <tr key={`${item.rawMaterialId}-${idx}`} className="hover:bg-slate-50/50">
                              <td className="py-2 px-3 font-mono text-purple-900 font-semibold">
                                {item.rawMaterialCode}
                              </td>
                              <td className="py-2 px-3 font-medium text-slate-900">
                                {item.rawMaterialName}
                              </td>
                              <td className="py-2 px-3 text-right font-mono tabular-nums">
                                {item.quantity} {item.unit}
                              </td>
                              <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600">
                                {formatCurrency(unitCost)}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-semibold tabular-nums text-purple-950">
                                {formatCurrency(subtotal)}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBomItem(idx)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Resumo Financeiro da Ficha Técnica */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Custo Total de Matérias-Primas:</span>
                    <strong className="text-sm font-mono text-slate-900">{formatCurrency(calculatedCost)}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Margem Bruta Unitária:</span>
                    <strong className={`text-sm font-mono ${calculatedMarginVal >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {formatCurrency(calculatedMarginVal)} ({calculatedMarginPct.toFixed(1)}%)
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Tempo de Manufatura:</span>
                    <strong className="text-sm font-mono text-purple-900">{formatTimeMinutes(formProcessMinutes)}</strong>
                  </div>
                </div>
              </div>

              {/* Botões do Formulário */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
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
                  {editingProduct ? 'Salvar Ficha Técnica' : 'Criar Produto com Ficha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal / Drawer: Ver Ficha Técnica Completa */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-300" />
                  <span>Ficha Técnica Detalhada: {viewProduct.name}</span>
                </h3>
                <p className="text-xs text-purple-200 mt-0.5 font-mono">
                  {viewProduct.code} · Categoria: {viewProduct.category}
                </p>
              </div>
              <button
                onClick={() => setViewProduct(null)}
                className="text-purple-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {viewProduct.description && (
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {viewProduct.description}
                </p>
              )}

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-slate-500 block text-[11px]">Preço de Venda</span>
                  <strong className="text-sm font-bold text-slate-900 font-mono">{formatCurrency(viewProduct.salePrice)}</strong>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-slate-500 block text-[11px]">Custo Materiais (BOM)</span>
                  <strong className="text-sm font-bold text-slate-900 font-mono">{formatCurrency(calculateBomTotalCost(viewProduct.bom || []))}</strong>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-slate-500 block text-[11px]">Tempo Operacional</span>
                  <strong className="text-sm font-bold text-purple-900 font-mono">{formatTimeMinutes(viewProduct.processTimeMinutes)}</strong>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Lista de Insumos da Receita
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Código</th>
                        <th className="py-2.5 px-3">Matéria-Prima</th>
                        <th className="py-2.5 px-3 text-right">Qtd / Peça</th>
                        <th className="py-2.5 px-3 text-right">Custo Insumo</th>
                        <th className="py-2.5 px-3 text-right">Total na Peça</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {(viewProduct.bom || []).map((item, i) => {
                        const rm = rawMaterials.find((m) => m.id === item.rawMaterialId);
                        const unitCost = rm ? rm.unitCost : item.unitCost;
                        const total = item.quantity * unitCost;

                        return (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-mono text-purple-900 font-semibold">
                              {item.rawMaterialCode}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-900">
                              {item.rawMaterialName}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                              {formatCurrency(unitCost)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-purple-950">
                              {formatCurrency(total)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const id = viewProduct.id;
                    setViewProduct(null);
                    setPrintTargetProductId(id);
                    setPrintModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-purple-900 bg-purple-100 hover:bg-purple-200 border border-purple-300 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-purple-700" />
                  <span>Imprimir / Salvar PDF</span>
                </button>
                <button
                  onClick={() => {
                    const p = viewProduct;
                    setViewProduct(null);
                    handleOpenEdit(p);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar esta Ficha</span>
                </button>
              </div>
              <button
                onClick={() => setViewProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Impressão de Ficha Técnica (BOM) */}
      <PrintBomReportModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        products={products}
        rawMaterials={rawMaterials}
        initialProductId={printTargetProductId}
      />
    </div>
  );
};
