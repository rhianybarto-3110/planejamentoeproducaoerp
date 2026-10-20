import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { CustomerOrder, OrderItem, OrderStatus } from '../../types';
import { 
  ShoppingCart, 
  Plus, 
  Edit2, 
  Trash2, 
  Factory, 
  Eye, 
  Calendar, 
  User, 
  X, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';

interface OrdersViewProps {
  onOpenDeleteConfirm: (id: string, code: string) => void;
  onNavigateToOps?: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onOpenDeleteConfirm, onNavigateToOps }) => {
  const { 
    orders, 
    partners, 
    products, 
    addOrder, 
    updateOrder, 
    generateProductionOrdersFromOrder, 
    searchTerm 
  } = useERP();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<CustomerOrder | null>(null);

  // Detail Modal state
  const [viewingOrder, setViewingOrder] = useState<CustomerOrder | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'todos' | OrderStatus>('todos');

  // Form states
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formOrderDate, setFormOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDeliveryDeadline, setFormDeliveryDeadline] = useState('');
  const [formStatus, setFormStatus] = useState<OrderStatus>('pendente');
  const [formNotes, setFormNotes] = useState('');
  const [formItems, setFormItems] = useState<OrderItem[]>([]);
  const [formError, setFormError] = useState('');

  // Item builder inputs
  const [itemProductId, setItemProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemUnitPrice, setItemUnitPrice] = useState<number>(0);

  const clients = partners.filter((p) => p.type === 'cliente' || p.type === 'ambos');

  const handleOpenAdd = () => {
    setEditingOrder(null);
    setFormCustomerId(clients[0]?.id || '');
    setFormOrderDate(new Date().toISOString().split('T')[0]);

    // Default deadline 14 days ahead
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setFormDeliveryDeadline(d.toISOString().split('T')[0]);

    setFormStatus('pendente');
    setFormNotes('');
    setFormItems([]);
    setFormError('');
    setItemProductId('');
    setItemQuantity(1);
    setItemUnitPrice(0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (order: CustomerOrder) => {
    setEditingOrder(order);
    setFormCustomerId(order.customerId);
    setFormOrderDate(order.orderDate);
    setFormDeliveryDeadline(order.deliveryDeadline);
    setFormStatus(order.status);
    setFormNotes(order.notes || '');
    setFormItems(order.items ? [...order.items] : []);
    setFormError('');
    setItemProductId('');
    setItemQuantity(1);
    setItemUnitPrice(0);
    setIsModalOpen(true);
  };

  const handleProductSelect = (prodId: string) => {
    setItemProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setItemUnitPrice(prod.salePrice);
    }
  };

  const handleAddItem = () => {
    if (!itemProductId) {
      alert('Selecione um produto para incluir no pedido.');
      return;
    }
    if (itemQuantity <= 0) {
      alert('A quantidade deve ser maior que zero.');
      return;
    }

    const prod = products.find((p) => p.id === itemProductId);
    if (!prod) return;

    const unitPrice = itemUnitPrice > 0 ? itemUnitPrice : prod.salePrice;
    const total = itemQuantity * unitPrice;

    // Check if item already exists in list
    const existingIndex = formItems.findIndex((it) => it.productId === itemProductId);
    if (existingIndex >= 0) {
      const updated = [...formItems];
      updated[existingIndex].quantity += itemQuantity;
      updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setFormItems(updated);
    } else {
      const newItem: OrderItem = {
        productId: prod.id,
        productCode: prod.code,
        productName: prod.name,
        quantity: itemQuantity,
        unitPrice,
        total,
      };
      setFormItems([...formItems, newItem]);
    }

    setItemProductId('');
    setItemQuantity(1);
    setItemUnitPrice(0);
  };

  const handleRemoveItem = (index: number) => {
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const calculateTotalOrderAmount = () => {
    return formItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formCustomerId) {
      setFormError('Selecione o cliente responsável pelo pedido.');
      return;
    }
    if (!formDeliveryDeadline) {
      setFormError('Defina a data limite para entrega ao cliente.');
      return;
    }
    if (formItems.length === 0) {
      setFormError('Adicione pelo menos um produto na lista do pedido.');
      return;
    }

    const customer = partners.find((p) => p.id === formCustomerId);
    const customerName = customer ? customer.name : 'Cliente';
    const totalAmount = calculateTotalOrderAmount();

    if (editingOrder) {
      updateOrder(editingOrder.id, {
        customerId: formCustomerId,
        customerName,
        orderDate: formOrderDate,
        deliveryDeadline: formDeliveryDeadline,
        status: formStatus,
        notes: formNotes.trim() || undefined,
        items: formItems,
        totalAmount,
      });
    } else {
      addOrder({
        customerId: formCustomerId,
        customerName,
        orderDate: formOrderDate,
        deliveryDeadline: formDeliveryDeadline,
        status: formStatus,
        notes: formNotes.trim() || undefined,
        items: formItems,
        totalAmount,
      });
    }

    setIsModalOpen(false);
  };

  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      o.code.toLowerCase().includes(term) ||
      o.customerName.toLowerCase().includes(term) ||
      o.items.some((i) => i.productName.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (statusFilter !== 'todos') {
      return o.status === statusFilter;
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
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('pendente')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'pendente'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-800 hover:bg-amber-100/50'
            }`}
          >
            Pendentes ({orders.filter((o) => o.status === 'pendente').length})
          </button>
          <button
            onClick={() => setStatusFilter('em_producao')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'em_producao'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-purple-700 hover:bg-purple-100/50'
            }`}
          >
            Em Produção ({orders.filter((o) => o.status === 'em_producao').length})
          </button>
          <button
            onClick={() => setStatusFilter('pronto')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'pronto'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-100/50'
            }`}
          >
            Prontos / Entregues ({orders.filter((o) => o.status === 'pronto' || o.status === 'entregue').length})
          </button>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Pedido de Venda</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-purple-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-purple-50/50 border-b border-purple-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Data do Pedido</th>
                <th className="py-3 px-4">Prazo de Entrega</th>
                <th className="py-3 px-4">Itens Encomendados</th>
                <th className="py-3 px-4 text-right">Valor Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Ordem de Produção</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <ShoppingCart className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-500">Nenhum pedido cadastrado nesta visualização.</p>
                    <p className="text-xs text-slate-400 mt-1">Clique no botão acima para registrar um novo pedido.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const hasOp = ord.linkedOpIds && ord.linkedOpIds.length > 0;
                  return (
                    <tr key={ord.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-purple-900">
                        {ord.code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {ord.customerName}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {formatDate(ord.orderDate)}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium font-mono">
                        {formatDate(ord.deliveryDeadline)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-medium text-slate-800">
                          {ord.items.length} {ord.items.length === 1 ? 'produto' : 'produtos'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">
                          {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-purple-950 tabular-nums">
                        {formatCurrency(ord.totalAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          ord.status === 'em_producao'
                            ? 'bg-purple-100 text-purple-800'
                            : ord.status === 'confirmado'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'pronto' || ord.status === 'entregue'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'cancelado'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {hasOp ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-800 bg-purple-50 px-2 py-1 rounded-md border border-purple-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                            <span>OP Emitida</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => generateProductionOrdersFromOrder(ord.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-md shadow-2xs transition-colors"
                          >
                            <Factory className="w-3.5 h-3.5" />
                            <span>Gerar OP</span>
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingOrder(ord)}
                            title="Ver detalhes do pedido"
                            className="p-1.5 text-purple-700 hover:text-purple-900 hover:bg-purple-100 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(ord)}
                            title="Editar pedido"
                            className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenDeleteConfirm(ord.id, ord.code)}
                            title="Excluir pedido"
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

      {/* Modal: Novo / Editar Pedido */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
            <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-base flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-300" />
                <span>{editingOrder ? `Editar Pedido: ${editingOrder.code}` : 'Novo Pedido de Venda'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-purple-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="p-6 overflow-y-auto space-y-4 flex-1">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cliente Solicitante *
                  </label>
                  <select
                    value={formCustomerId}
                    onChange={(e) => setFormCustomerId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    required
                  >
                    <option value="">Selecione o cliente...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.document})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status do Pedido *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  >
                    <option value="pendente">Pendente de Produção</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="em_producao">Em Produção na Fábrica</option>
                    <option value="pronto">Pronto para Entrega</option>
                    <option value="entregue">Entregue / Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data de Emissão do Pedido *
                  </label>
                  <input
                    type="date"
                    value={formOrderDate}
                    onChange={(e) => setFormOrderDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prazo Prometido de Entrega *
                  </label>
                  <input
                    type="date"
                    value={formDeliveryDeadline}
                    onChange={(e) => setFormDeliveryDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Itens do Pedido Builder */}
              <div className="pt-2 border-t border-purple-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-950 mb-2">
                  Produtos Encomendados
                </h4>

                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex flex-col sm:flex-row items-end gap-2 mb-3">
                  <div className="flex-1 w-full">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Produto Acabado
                    </label>
                    <select
                      value={itemProductId}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    >
                      <option value="">Selecione um produto do catálogo...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.code} - {p.name} ({formatCurrency(p.salePrice)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full sm:w-28">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>

                  <div className="w-full sm:w-32">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Preço Unitário (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={itemUnitPrice}
                      onChange={(e) => setItemUnitPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full sm:w-auto px-4 py-1.5 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-xs transition-colors shrink-0"
                  >
                    + Adicionar
                  </button>
                </div>

                {/* Tabela de Itens Selecionados */}
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-2 px-3">Código</th>
                        <th className="py-2 px-3">Produto</th>
                        <th className="py-2 px-3 text-right">Qtd</th>
                        <th className="py-2 px-3 text-right">Preço Unit.</th>
                        <th className="py-2 px-3 text-right">Total</th>
                        <th className="py-2 px-3 text-center">Remover</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {formItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-xs text-slate-400">
                            Nenhum item adicionado ao pedido ainda.
                          </td>
                        </tr>
                      ) : (
                        formItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-mono text-purple-900 font-semibold">
                              {item.productCode}
                            </td>
                            <td className="py-2 px-3 font-medium text-slate-900">
                              {item.productName}
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">
                              {item.quantity} un
                            </td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold tabular-nums text-purple-950">
                              {formatCurrency(item.total)}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-semibold">Total Geral do Pedido:</span>
                  <span className="text-base font-extrabold font-mono text-purple-950">
                    {formatCurrency(calculateTotalOrderAmount())}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações e Instruções Especiais de Entrega
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="Local de entrega, contato do recebedor, condições combinadas..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

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
                  {editingOrder ? 'Salvar Alterações' : 'Concluir Pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalhes do Pedido */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-amber-300" />
                  <span>Pedido de Venda: {viewingOrder.code}</span>
                </h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  Cliente: {viewingOrder.customerName}
                </p>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="text-purple-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-slate-500 block text-[11px]">Data Emissão</span>
                  <strong className="text-sm font-bold text-slate-900 font-mono">{formatDate(viewingOrder.orderDate)}</strong>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-slate-500 block text-[11px]">Prazo de Entrega</span>
                  <strong className="text-sm font-bold text-slate-900 font-mono">{formatDate(viewingOrder.deliveryDeadline)}</strong>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-slate-500 block text-[11px]">Status</span>
                  <strong className="text-sm font-bold text-purple-900 capitalize">{viewingOrder.status.replace('_', ' ')}</strong>
                </div>
              </div>

              {viewingOrder.notes && (
                <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                  <strong>Observações:</strong> {viewingOrder.notes}
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Itens do Pedido
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Código</th>
                        <th className="py-2.5 px-3">Produto</th>
                        <th className="py-2.5 px-3 text-right">Qtd</th>
                        <th className="py-2.5 px-3 text-right">Preço Unit.</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {viewingOrder.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-mono font-bold text-purple-900">
                            {it.productCode}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-900">
                            {it.productName}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                            {it.quantity} un
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                            {formatCurrency(it.unitPrice)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-purple-950">
                            {formatCurrency(it.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 text-right text-sm font-bold text-purple-950 font-mono">
                  Total Geral: {formatCurrency(viewingOrder.totalAmount)}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              {(!viewingOrder.linkedOpIds || viewingOrder.linkedOpIds.length === 0) ? (
                <button
                  onClick={() => {
                    generateProductionOrdersFromOrder(viewingOrder.id);
                    setViewingOrder(null);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Factory className="w-3.5 h-3.5" />
                  <span>Gerar Ordem de Produção (OP)</span>
                </button>
              ) : (
                <span className="text-xs text-purple-800 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-purple-700" />
                  Ordens de produção já emitidas
                </span>
              )}

              <button
                onClick={() => setViewingOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
