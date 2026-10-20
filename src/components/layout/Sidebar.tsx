import React from 'react';
import { useERP } from '../../context/ERPContext';
import { useAuth } from '../../context/AuthContext';
import { ActiveModule } from '../../types';
import {
  LayoutDashboard,
  Layers,
  Boxes,
  Users,
  Gauge,
  ShoppingCart,
  Factory,
  Rocket,
  LogOut,
  RefreshCw,
  Download,
  Upload,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  onOpenDeployGuide: () => void;
  onOpenResetConfirm: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenDeployGuide, onOpenResetConfirm }) => {
  const { 
    activeModule, 
    setActiveModule, 
    rawMaterials, 
    orders, 
    productionOrders,
    exportDatabaseJSON,
    importDatabaseJSON,
  } = useERP();

  const { user, logout } = useAuth();

  // Badges calculation
  const lowStockCount = rawMaterials.filter((m) => m.currentStock <= m.minStock).length;
  const activeOrdersCount = orders.filter((o) => o.status === 'pendente' || o.status === 'confirmado' || o.status === 'em_producao').length;
  const inProgressOpsCount = productionOrders.filter((op) => op.status === 'em_producao' || op.status === 'pendente').length;

  const menuItems: { id: ActiveModule; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Painel Geral',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'products_bom',
      label: 'Fichas Técnicas (BOM)',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'raw_materials',
      label: 'Matérias-Primas',
      icon: <Boxes className="w-4 h-4" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-amber-500 text-purple-950',
    },
    {
      id: 'partners',
      label: 'Clientes & Fornecedores',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'capacity',
      label: 'Capacidade Produtiva',
      icon: <Gauge className="w-4 h-4" />,
    },
    {
      id: 'orders',
      label: 'Pedidos de Venda',
      icon: <ShoppingCart className="w-4 h-4" />,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
      badgeColor: 'bg-purple-600 text-white',
    },
    {
      id: 'production_orders',
      label: 'Ordens de Produção',
      icon: <Factory className="w-4 h-4" />,
      badge: inProgressOpsCount > 0 ? inProgressOpsCount : undefined,
      badgeColor: 'bg-violet-600 text-white',
    },
  ];

  const handleExportBackup = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-planoroxo-erp-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDatabaseJSON(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <aside className="w-64 shrink-0 bg-[#1d0c38] text-purple-100 flex flex-col border-r border-purple-900/60 select-none min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-purple-900/40 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-700 flex items-center justify-center text-white shadow-md shadow-purple-950/40 ring-1 ring-purple-400/30">
          <Factory className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
            PlanoRoxo <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-purple-800 text-purple-200">ERP</span>
          </h1>
          <p className="text-[11px] text-purple-300 truncate max-w-[150px]">
            {user?.companyName || 'Pequena Empresa'}
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-purple-400">
          Módulos do Sistema
        </div>

        {menuItems.map((item) => {
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-purple-700 text-white shadow-sm shadow-purple-950/20 font-semibold'
                  : 'text-purple-200 hover:bg-purple-900/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`${isActive ? 'text-white' : 'text-purple-400 group-hover:text-purple-200'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Dedicated Vercel Guide Button */}
        <div className="pt-3">
          <button
            onClick={onOpenDeployGuide}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all border ${
              activeModule === 'vercel_guide'
                ? 'bg-gradient-to-r from-purple-800 to-indigo-800 text-white border-purple-400'
                : 'bg-purple-900/30 border-purple-700/50 text-purple-200 hover:bg-purple-800/40 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Rocket className="w-4 h-4 text-amber-300" />
              <span>Publicar na Vercel</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-purple-950 px-1.5 py-0.5 rounded">
              Guia
            </span>
          </button>
        </div>
      </div>

      {/* Database Backup & Maintenance Actions */}
      <div className="px-3 py-3 border-t border-purple-900/40 bg-purple-950/40 space-y-1">
        <div className="flex items-center justify-between px-2 text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-1">
          <span>Dados Locais</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={handleExportBackup}
            title="Baixar arquivo JSON com todos os dados atuais"
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium bg-purple-900/50 hover:bg-purple-800 text-purple-200 hover:text-white rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-purple-300" />
            <span>Exportar</span>
          </button>

          <label
            title="Restaurar backup JSON do computador"
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium bg-purple-900/50 hover:bg-purple-800 text-purple-200 hover:text-white rounded-md transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-purple-300" />
            <span>Importar</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>

        <button
          onClick={onOpenResetConfirm}
          title="Recarregar dados originais da fábrica"
          className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium text-purple-300 hover:text-amber-200 hover:bg-purple-900/40 rounded-md transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Restaurar Demonstração</span>
        </button>
      </div>

      {/* User profile footer */}
      <div className="p-3 border-t border-purple-900/40 bg-[#16082c] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-purple-700 border border-purple-400/40 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Gestor'}</p>
            <p className="text-[10px] text-purple-300 truncate">{user?.role || 'Acesso Direto'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sair ou trocar de usuário"
          className="p-1.5 text-purple-300 hover:text-rose-300 hover:bg-purple-900/40 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
