/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ERPProvider, useERP } from './context/ERPContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { ConfirmationModal } from './components/common/ConfirmationModal';
import { AuthModal } from './components/auth/AuthModal';

// Module views
import { DashboardView } from './components/modules/DashboardView';
import { ProductsBomView } from './components/modules/ProductsBomView';
import { RawMaterialsView } from './components/modules/RawMaterialsView';
import { PartnersView } from './components/modules/PartnersView';
import { CapacityView } from './components/modules/CapacityView';
import { OrdersView } from './components/modules/OrdersView';
import { ProductionOrdersView } from './components/modules/ProductionOrdersView';
import { VercelDeployGuideModal } from './components/modules/VercelDeployGuideModal';
import { PrintMaterialsReportModal } from './components/reports/PrintMaterialsReportModal';
import { PrintBomReportModal } from './components/reports/PrintBomReportModal';

type DeleteTargetType = 'partner' | 'material' | 'product' | 'order' | 'op' | 'reset';

interface DeleteConfirmState {
  id: string;
  name: string;
  type: DeleteTargetType;
  title: string;
  message: string;
}

function MainApp() {
  const { isAuthenticated } = useAuth();
  const { 
    activeModule, 
    setActiveModule, 
    deletePartner, 
    deleteRawMaterial, 
    deleteProduct, 
    deleteOrder, 
    deleteProductionOrder, 
    resetAllData,
    products,
    rawMaterials
  } = useERP();

  // Modal triggers
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null);

  // Global Print modal states
  const [isGlobalPrintBomOpen, setIsGlobalPrintBomOpen] = useState(false);
  const [isGlobalPrintMaterialsOpen, setIsGlobalPrintMaterialsOpen] = useState(false);

  // Quick action states across modules
  const [adjustTargetMaterialId, setAdjustTargetMaterialId] = useState<string | null>(null);

  // Trigger modals for delete
  const handleOpenDeletePartner = (id: string, name: string) => {
    setDeleteConfirm({
      id,
      name,
      type: 'partner',
      title: 'Excluir Parceiro Comercial?',
      message: `Tem certeza que deseja excluir "${name}"? Esta ação só é permitida se o parceiro não possuir vínculos com pedidos ou matérias-primas.`,
    });
  };

  const handleOpenDeleteMaterial = (id: string, name: string) => {
    setDeleteConfirm({
      id,
      name,
      type: 'material',
      title: 'Excluir Matéria-Prima?',
      message: `Tem certeza que deseja excluir "${name}" do almoxarifado? Itens vinculados a fichas técnicas de produtos não podem ser removidos.`,
    });
  };

  const handleOpenDeleteProduct = (id: string, name: string) => {
    setDeleteConfirm({
      id,
      name,
      type: 'product',
      title: 'Excluir Produto e Ficha Técnica?',
      message: `Deseja remover "${name}" do catálogo? Produtos com pedidos de venda ativos não poderão ser excluídos.`,
    });
  };

  const handleOpenDeleteOrder = (id: string, code: string) => {
    setDeleteConfirm({
      id,
      name: code,
      type: 'order',
      title: 'Cancelar e Excluir Pedido?',
      message: `Deseja excluir o pedido ${code}? Todas as informações deste pedido serão apagadas permanentemente.`,
    });
  };

  const handleOpenDeleteOp = (id: string, code: string) => {
    setDeleteConfirm({
      id,
      name: code,
      type: 'op',
      title: 'Excluir Ordem de Produção?',
      message: `Tem certeza que deseja excluir a OP ${code}? O registro de fabricação será cancelado.`,
    });
  };

  const handleOpenResetConfirm = () => {
    setDeleteConfirm({
      id: 'reset',
      name: 'Demonstração de Fábrica',
      type: 'reset',
      title: 'Restaurar Dados de Fábrica?',
      message: 'Esta ação substituirá os dados atuais pelo conjunto de dados original de demonstração da pequena empresa. Deseja continuar?',
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;

    switch (deleteConfirm.type) {
      case 'partner':
        deletePartner(deleteConfirm.id);
        break;
      case 'material':
        deleteRawMaterial(deleteConfirm.id);
        break;
      case 'product':
        deleteProduct(deleteConfirm.id);
        break;
      case 'order':
        deleteOrder(deleteConfirm.id);
        break;
      case 'op':
        deleteProductionOrder(deleteConfirm.id);
        break;
      case 'reset':
        resetAllData();
        break;
    }

    setDeleteConfirm(null);
  };

  // If user signed out, show auth modal
  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
        onOpenResetConfirm={handleOpenResetConfirm}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          {activeModule === 'dashboard' && (
            <DashboardView
              onNavigate={(mod) => setActiveModule(mod)}
              onOpenCreateOrder={() => setActiveModule('orders')}
              onOpenCreateOp={() => setActiveModule('production_orders')}
              onOpenAdjustStock={(matId) => {
                setAdjustTargetMaterialId(matId);
                setActiveModule('raw_materials');
              }}
              onOpenPrintBom={() => setIsGlobalPrintBomOpen(true)}
              onOpenPrintMaterials={() => setIsGlobalPrintMaterialsOpen(true)}
            />
          )}

          {activeModule === 'products_bom' && (
            <ProductsBomView
              onOpenDeleteConfirm={handleOpenDeleteProduct}
            />
          )}

          {activeModule === 'raw_materials' && (
            <RawMaterialsView
              onOpenDeleteConfirm={handleOpenDeleteMaterial}
              adjustTargetId={adjustTargetMaterialId}
              onClearAdjustTarget={() => setAdjustTargetMaterialId(null)}
            />
          )}

          {activeModule === 'partners' && (
            <PartnersView
              onOpenDeleteConfirm={handleOpenDeletePartner}
            />
          )}

          {activeModule === 'capacity' && (
            <CapacityView />
          )}

          {activeModule === 'orders' && (
            <OrdersView
              onOpenDeleteConfirm={handleOpenDeleteOrder}
              onNavigateToOps={() => setActiveModule('production_orders')}
            />
          )}

          {activeModule === 'production_orders' && (
            <ProductionOrdersView
              onOpenDeleteConfirm={handleOpenDeleteOp}
            />
          )}

          {activeModule === 'vercel_guide' && (
            <div className="p-6">
              <VercelDeployGuideModal
                isOpen={true}
                onClose={() => setActiveModule('dashboard')}
              />
            </div>
          )}
        </main>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteConfirm}
        title={deleteConfirm?.title || 'Confirmar Operação'}
        message={deleteConfirm?.message || ''}
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        isDestructive={deleteConfirm?.type !== 'reset'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* Vercel Deployment Modal */}
      <VercelDeployGuideModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />

      {/* Relatórios de Impressão e Exportação em PDF */}
      <PrintMaterialsReportModal
        isOpen={isGlobalPrintMaterialsOpen}
        onClose={() => setIsGlobalPrintMaterialsOpen(false)}
        rawMaterials={rawMaterials}
      />

      <PrintBomReportModal
        isOpen={isGlobalPrintBomOpen}
        onClose={() => setIsGlobalPrintBomOpen(false)}
        products={products}
        rawMaterials={rawMaterials}
      />

      {/* Toast feedback alerts */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ERPProvider>
        <MainApp />
      </ERPProvider>
    </AuthProvider>
  );
}
