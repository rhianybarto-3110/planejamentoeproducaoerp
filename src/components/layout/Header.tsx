import React from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  Rocket, 
  Search, 
  Plus, 
  Layers, 
  Boxes, 
  Users, 
  Gauge, 
  ShoppingCart, 
  Factory, 
  LayoutDashboard 
} from 'lucide-react';

interface HeaderProps {
  onOpenDeployGuide: () => void;
  onOpenCreateModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDeployGuide, onOpenCreateModal }) => {
  const { activeModule, searchTerm, setSearchTerm } = useERP();

  const getModuleDetails = () => {
    switch (activeModule) {
      case 'dashboard':
        return {
          title: 'Painel Geral de Produção',
          subtitle: 'Visão executiva dos pedidos, estoque e carga das máquinas',
          createBtnLabel: null,
          icon: <LayoutDashboard className="w-5 h-5 text-purple-700" />,
        };
      case 'products_bom':
        return {
          title: 'Fichas Técnicas dos Produtos (BOM)',
          subtitle: 'Estrutura de composição de matérias-primas e tempos de processo',
          createBtnLabel: 'Novo Produto',
          icon: <Layers className="w-5 h-5 text-purple-700" />,
        };
      case 'raw_materials':
        return {
          title: 'Estoque de Matérias-Primas',
          subtitle: 'Insumos, unidades de medida, ponto de pedido e custos médios',
          createBtnLabel: 'Nova Matéria-Prima',
          icon: <Boxes className="w-5 h-5 text-purple-700" />,
        };
      case 'partners':
        return {
          title: 'Clientes e Fornecedores',
          subtitle: 'Diretório de contatos comerciais, CNPJ/CPF e endereços',
          createBtnLabel: 'Novo Parceiro',
          icon: <Users className="w-5 h-5 text-purple-700" />,
        };
      case 'capacity':
        return {
          title: 'Capacidade Produtiva da Fábrica',
          subtitle: 'Jornada de trabalho, horas disponíveis, postos e simulador de gargalo',
          createBtnLabel: null,
          icon: <Gauge className="w-5 h-5 text-purple-700" />,
        };
      case 'orders':
        return {
          title: 'Pedidos de Clientes',
          subtitle: 'Controle de vendas, itens encomendados e geração de OPs',
          createBtnLabel: 'Novo Pedido',
          icon: <ShoppingCart className="w-5 h-5 text-purple-700" />,
        };
      case 'production_orders':
        return {
          title: 'Ordens de Produção (OP)',
          subtitle: 'Acompanhamento de fabricação, cálculo de prazos e baixa de estoque',
          createBtnLabel: 'Nova Ordem de Produção',
          icon: <Factory className="w-5 h-5 text-purple-700" />,
        };
      case 'vercel_guide':
        return {
          title: 'Guia de Publicação na Vercel',
          subtitle: 'Configurações recomendadas para publicar seu projeto em produção',
          createBtnLabel: null,
          icon: <Rocket className="w-5 h-5 text-purple-700" />,
        };
      default:
        return {
          title: 'PlanoRoxo ERP',
          subtitle: 'Sistema de Planejamento e Controle',
          createBtnLabel: null,
          icon: <Factory className="w-5 h-5 text-purple-700" />,
        };
    }
  };

  const details = getModuleDetails();

  return (
    <header className="h-16 px-6 bg-white border-b border-purple-100 flex items-center justify-between gap-6 shrink-0 shadow-xs z-10">
      {/* Zone 1: Contextual Title & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="p-2 rounded-lg bg-purple-50 shrink-0">
          {details.icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900 leading-tight truncate">
            {details.title}
          </h2>
          <p className="text-xs text-slate-500 truncate hidden sm:block">
            {details.subtitle}
          </p>
        </div>
      </div>

      {/* Zone 2: Search input for table views */}
      {activeModule !== 'capacity' && activeModule !== 'vercel_guide' && (
        <div className="hidden md:flex items-center flex-1 max-w-xs relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar registros..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white text-slate-800 placeholder-slate-400 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenDeployGuide}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200/60 transition-colors whitespace-nowrap"
        >
          <Rocket className="w-3.5 h-3.5 text-purple-700" />
          <span>Deploy Vercel</span>
        </button>

        {details.createBtnLabel && onOpenCreateModal && (
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm shadow-purple-900/10 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{details.createBtnLabel}</span>
          </button>
        )}
      </div>
    </header>
  );
};
