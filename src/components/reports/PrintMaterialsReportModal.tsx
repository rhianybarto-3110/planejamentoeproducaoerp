import React, { useState } from 'react';
import { RawMaterial } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Printer, X, Filter, Download, FileText, CheckCircle2, AlertTriangle, Building2 } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';

interface PrintMaterialsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawMaterials: RawMaterial[];
}

export const PrintMaterialsReportModal: React.FC<PrintMaterialsReportModalProps> = ({
  isOpen,
  onClose,
  rawMaterials,
}) => {
  const { user } = useAuth();
  const [filterMode, setFilterMode] = useState<'todos' | 'criticos'>('todos');

  if (!isOpen) return null;

  const filteredMaterials = filterMode === 'criticos'
    ? rawMaterials.filter((m) => m.currentStock <= m.minStock)
    : rawMaterials;

  const totalStockValue = filteredMaterials.reduce(
    (sum, m) => sum + (m.currentStock * m.unitCost),
    0
  );

  const criticalCount = rawMaterials.filter((m) => m.currentStock <= m.minStock).length;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-purple-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Modal Controls Header (Hidden during print) */}
        <div className="no-print bg-purple-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-700/60 rounded-lg">
              <Printer className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Impressão de Relatório de Matérias-Primas</h3>
              <p className="text-xs text-purple-200">
                Visualização e exportação formatada para A4 / PDF com controle de almoxarifado
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <div className="inline-flex items-center p-1 bg-purple-950/60 rounded-lg text-xs">
              <button
                onClick={() => setFilterMode('todos')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  filterMode === 'todos'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                Todos ({rawMaterials.length})
              </button>
              <button
                onClick={() => setFilterMode('criticos')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  filterMode === 'criticos'
                    ? 'bg-amber-500 text-purple-950 font-bold shadow-xs'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                Só Críticos ({criticalCount})
              </button>
            </div>

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

        {/* Printable Document Area */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          <div
            id="printable-report"
            className="w-full max-w-4xl bg-white text-slate-900 p-8 sm:p-10 shadow-md border border-slate-200 min-h-[842px] text-xs font-sans"
          >
            {/* Header Oficial do Relatório */}
            <div className="border-b-2 border-purple-900 pb-4 mb-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-900 text-white flex items-center justify-center font-bold text-sm">
                    PCP
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-purple-950 uppercase tracking-tight">
                      {user?.companyName || 'Indústria & Manufatura'}
                    </h1>
                    <p className="text-[11px] text-slate-500">
                      Sistema de Gestão e Planejamento da Produção (ERP)
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-600">
                <span className="font-bold uppercase tracking-wider block text-purple-900">
                  Relatório de Estoque e Insumos
                </span>
                <span>Emissão: <strong>{currentDate}</strong></span>
                <span className="block text-slate-400">Emissor: {user?.name || 'Administrador'}</span>
              </div>
            </div>

            {/* Sub-header / Cards de Resumo */}
            <div className="grid grid-cols-3 gap-3 mb-6 p-3 bg-purple-50/60 rounded-lg border border-purple-100">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total de Itens Listados</span>
                <strong className="text-sm font-mono text-purple-950 font-bold">{filteredMaterials.length} insumos</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Itens Abaixo do Mínimo</span>
                <strong className={`text-sm font-mono font-bold ${criticalCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {criticalCount} {criticalCount === 1 ? 'item crítico' : 'itens críticos'}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Valor Total Imobilizado</span>
                <strong className="text-sm font-mono text-purple-950 font-bold">{formatCurrency(totalStockValue)}</strong>
              </div>
            </div>

            {/* Tabela de Insumos */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2 px-2">Código</th>
                    <th className="py-2 px-2">Descrição da Matéria-Prima</th>
                    <th className="py-2 px-2">Unid.</th>
                    <th className="py-2 px-2 text-right">Estoque Atual</th>
                    <th className="py-2 px-2 text-right">Mínimo</th>
                    <th className="py-2 px-2 text-right">Custo Unit.</th>
                    <th className="py-2 px-2 text-right">Total (R$)</th>
                    <th className="py-2 px-2 text-center">Status</th>
                    <th className="py-2 px-2">Localização / Fornecedor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredMaterials.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        Nenhum insumo encontrado para este filtro.
                      </td>
                    </tr>
                  ) : (
                    filteredMaterials.map((mat) => {
                      const isLow = mat.currentStock <= mat.minStock;
                      const totalItemValue = mat.currentStock * mat.unitCost;

                      return (
                        <tr key={mat.id} className={isLow ? 'bg-amber-50/40' : ''}>
                          <td className="py-2 px-2 font-mono font-bold text-purple-950">
                            {mat.code}
                          </td>
                          <td className="py-2 px-2 font-medium text-slate-900">
                            {mat.name}
                          </td>
                          <td className="py-2 px-2 uppercase font-mono text-slate-600">
                            {mat.unit}
                          </td>
                          <td className={`py-2 px-2 text-right font-mono font-bold tabular-nums ${
                            isLow ? 'text-rose-700' : 'text-slate-900'
                          }`}>
                            {formatNumber(mat.currentStock, 2)}
                          </td>
                          <td className="py-2 px-2 text-right font-mono text-slate-500 tabular-nums">
                            {formatNumber(mat.minStock, 2)}
                          </td>
                          <td className="py-2 px-2 text-right font-mono tabular-nums text-slate-700">
                            {formatCurrency(mat.unitCost)}
                          </td>
                          <td className="py-2 px-2 text-right font-mono font-bold tabular-nums text-purple-950">
                            {formatCurrency(totalItemValue)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {isLow ? (
                              <span className="font-bold text-amber-900 text-[10px] bg-amber-100 px-1.5 py-0.5 rounded">
                                CRÍTICO
                              </span>
                            ) : (
                              <span className="text-emerald-800 text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                                REGULAR
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-slate-600 text-[10px]">
                            <div>{mat.warehouseLocation || 'Geral'}</div>
                            <div className="text-slate-400 truncate max-w-[140px]">{mat.supplierName || '-'}</div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-400 font-bold text-slate-900">
                    <td colSpan={6} className="py-3 px-2 text-right uppercase text-[10px] tracking-wider">
                      Valor Total do Almoxarifado:
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-sm text-purple-950 tabular-nums">
                      {formatCurrency(totalStockValue)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Assinaturas / Rodapé de Controle */}
            <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-slate-600 text-[11px]">
              <div>
                <div className="border-t border-slate-400 w-48 mx-auto mb-1"></div>
                <span className="font-semibold block text-slate-800">Responsável pelo Almoxarifado</span>
                <span className="text-[10px] text-slate-400">Conferência física de estoque</span>
              </div>
              <div>
                <div className="border-t border-slate-400 w-48 mx-auto mb-1"></div>
                <span className="font-semibold block text-slate-800">Diretoria / PCP</span>
                <span className="text-[10px] text-slate-400">Aprovação de compras e reposições</span>
              </div>
            </div>

            <div className="mt-8 text-center text-[10px] text-slate-400">
              Documento gerado eletronicamente por PlanoRoxo ERP em {currentDate}. Página 1 de 1.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
