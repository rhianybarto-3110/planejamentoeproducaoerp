import React, { useState } from 'react';
import { Product, RawMaterial } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Printer, X, Layers, Clock, DollarSign, Building2, Check } from 'lucide-react';
import { formatCurrency, formatNumber, formatTimeMinutes } from '../../utils/formatters';

interface PrintBomReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  rawMaterials: RawMaterial[];
  initialProductId?: string;
}

export const PrintBomReportModal: React.FC<PrintBomReportModalProps> = ({
  isOpen,
  onClose,
  products,
  rawMaterials,
  initialProductId,
}) => {
  const { user } = useAuth();
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProductId || (products[0]?.id || '')
  );
  const [printAll, setPrintAll] = useState<boolean>(false);

  // Sync initialProductId if changed
  React.useEffect(() => {
    if (initialProductId) {
      setSelectedProductId(initialProductId);
      setPrintAll(false);
    }
  }, [initialProductId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const productsToRender = printAll
    ? products
    : products.filter((p) => p.id === selectedProductId);

  const calculateProductCost = (prod: Product) => {
    return (prod.bom || []).reduce((acc, item) => {
      const rm = rawMaterials.find((m) => m.id === item.rawMaterialId);
      const cost = rm ? rm.unitCost : item.unitCost;
      return acc + (item.quantity * cost);
    }, 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-purple-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Controls Header (Hidden during printing) */}
        <div className="no-print bg-purple-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-700/60 rounded-lg">
              <Printer className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Impressão de Ficha Técnica (BOM)</h3>
              <p className="text-xs text-purple-200">
                Documentação de engenharia de produto, insumos e tempos para o chão de fábrica
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode selection */}
            <div className="flex items-center gap-1 p-1 bg-purple-950/60 rounded-lg text-xs">
              <button
                onClick={() => setPrintAll(false)}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  !printAll
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                Item Específico
              </button>
              <button
                onClick={() => setPrintAll(true)}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  printAll
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                Catálogo Completo ({products.length})
              </button>
            </div>

            {!printAll && (
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="px-3 py-1.5 text-xs bg-purple-800 text-white border border-purple-600 rounded-lg focus:outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-purple-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm flex items-center gap-1.5 transition-transform hover:scale-105"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-purple-200 hover:text-white hover:bg-purple-800 rounded-lg transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          <div
            id="printable-report"
            className="w-full max-w-4xl bg-white text-slate-900 p-8 sm:p-10 shadow-md border border-slate-200 min-h-[842px] text-xs font-sans space-y-10"
          >
            {productsToRender.map((product, pIndex) => {
              const totalCost = calculateProductCost(product);
              const marginVal = product.salePrice - totalCost;
              const marginPct = product.salePrice > 0 ? (marginVal / product.salePrice) * 100 : 0;

              return (
                <div
                  key={product.id}
                  className={`space-y-6 ${pIndex > 0 ? 'page-break pt-6 border-t-2 border-dashed border-slate-300' : ''}`}
                >
                  {/* Top Company Header */}
                  <div className="border-b-2 border-purple-900 pb-4 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-900 text-white flex items-center justify-center font-bold text-sm">
                        PCP
                      </div>
                      <div>
                        <h1 className="text-base font-bold text-purple-950 uppercase tracking-tight">
                          {user?.companyName || 'Indústria & Manufatura'}
                        </h1>
                        <p className="text-[11px] text-slate-500">
                          Engenharia de Produção & Fichas Técnicas de Manufatura
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-600">
                      <span className="font-bold uppercase tracking-wider block text-purple-900">
                        Ficha Técnica de Fabricação (BOM)
                      </span>
                      <span>Emissão: <strong>{currentDate}</strong></span>
                      <span className="block text-slate-400">Documento Oficial de Engenharia</span>
                    </div>
                  </div>

                  {/* Informações Principais do Produto */}
                  <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-200/80">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-purple-900 uppercase tracking-wider">
                          Código SKU: {product.code}
                        </span>
                        <h2 className="text-lg font-bold text-slate-900 leading-tight">
                          {product.name}
                        </h2>
                        <span className="text-xs text-slate-600 font-medium">
                          Categoria: {product.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="p-2 bg-white rounded-lg border border-purple-200 text-center">
                          <span className="text-[10px] text-slate-500 uppercase block font-sans">Tempo de Fabricação</span>
                          <strong className="text-purple-950 text-sm">
                            {formatTimeMinutes(product.processTimeMinutes)}/un
                          </strong>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-purple-200 text-center">
                          <span className="text-[10px] text-slate-500 uppercase block font-sans">Preço de Venda</span>
                          <strong className="text-slate-900 text-sm">
                            {formatCurrency(product.salePrice)}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {product.description && (
                      <p className="mt-3 text-xs text-slate-600 leading-relaxed bg-white/60 p-2.5 rounded-lg border border-purple-100">
                        <strong>Especificações e Descrição:</strong> {product.description}
                      </p>
                    )}
                  </div>

                  {/* Tabela da Ficha Técnica (BOM) */}
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-purple-950 mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-700" />
                      <span>Composição de Matérias-Primas e Insumos por Unidade</span>
                    </h3>

                    <div className="border border-slate-300 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                            <th className="py-2.5 px-3">Código</th>
                            <th className="py-2.5 px-3">Matéria-Prima / Insumo</th>
                            <th className="py-2.5 px-3 text-right">Qtd. / Unidade</th>
                            <th className="py-2.5 px-3 text-right">Custo Unitário</th>
                            <th className="py-2.5 px-3 text-right">Subtotal na Peça</th>
                            <th className="py-2.5 px-3 text-right">% no Custo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {(!product.bom || product.bom.length === 0) ? (
                            <tr>
                              <td colSpan={6} className="py-6 text-center text-slate-400">
                                Nenhuma matéria-prima cadastrada na ficha deste produto.
                              </td>
                            </tr>
                          ) : (
                            product.bom.map((item, bIdx) => {
                              const rm = rawMaterials.find((m) => m.id === item.rawMaterialId);
                              const unitCost = rm ? rm.unitCost : item.unitCost;
                              const subtotal = item.quantity * unitCost;
                              const sharePct = totalCost > 0 ? (subtotal / totalCost) * 100 : 0;

                              return (
                                <tr key={bIdx} className="hover:bg-slate-50">
                                  <td className="py-2 px-3 font-mono font-bold text-purple-950">
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
                                  <td className="py-2 px-3 text-right font-mono font-bold tabular-nums text-purple-950">
                                    {formatCurrency(subtotal)}
                                  </td>
                                  <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-500">
                                    {sharePct.toFixed(1)}%
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                        <tfoot>
                          <tr className="bg-purple-50 font-bold border-t-2 border-purple-200">
                            <td colSpan={4} className="py-2.5 px-3 text-right uppercase text-[10px] tracking-wider text-purple-900">
                              Custo Total dos Insumos da Peça (BOM):
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-sm text-purple-950 tabular-nums">
                              {formatCurrency(totalCost)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-xs text-purple-900">
                              100%
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Resumo Econômico e Margem */}
                  <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 font-sans block uppercase">Custo dos Insumos</span>
                      <strong className="text-slate-800 text-sm">{formatCurrency(totalCost)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-sans block uppercase">Preço Praticado</span>
                      <strong className="text-slate-800 text-sm">{formatCurrency(product.salePrice)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-sans block uppercase">Margem Bruta Contábil</span>
                      <strong className={`text-sm ${marginVal >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {formatCurrency(marginVal)} ({marginPct.toFixed(1)}%)
                      </strong>
                    </div>
                  </div>

                  {/* Instruções para Bancada de Chão de Fábrica */}
                  <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/80 text-[11px] text-slate-700 space-y-1">
                    <strong className="font-bold text-amber-900 block uppercase text-[10px] tracking-wider">
                      Instruções Operacionais para Fabricação
                    </strong>
                    <p className="text-slate-600">
                      1. Conferir dimensões e cortes brutos antes da montagem definitiva.
                      2. Realizar inspeção de acabamento e fixação de componentes estruturais.
                      3. Apontar o início e o término da ordem no sistema ERP para cálculo da eficiência fabril.
                    </p>
                  </div>

                  {/* Assinaturas Técnicas */}
                  <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-slate-600 text-[11px]">
                    <div>
                      <div className="border-t border-slate-400 w-48 mx-auto mb-1"></div>
                      <span className="font-semibold block text-slate-800">Engenharia de Produto / PCP</span>
                      <span className="text-[10px] text-slate-400">Validação técnica da estrutura</span>
                    </div>
                    <div>
                      <div className="border-t border-slate-400 w-48 mx-auto mb-1"></div>
                      <span className="font-semibold block text-slate-800">Líder de Fabricação / Oficina</span>
                      <span className="text-[10px] text-slate-400">Execução e conformidade do lote</span>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-slate-400 pt-2">
                    Ficha Técnica ID: {product.id} · PlanoRoxo ERP · Emitido em {currentDate}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
