import React, { useState } from 'react';
import { SalesOrder, Customer, Product, SalesOrderStatus } from '../../types/erp';
import { StorageService } from '../../services/storage';
import { Plus, Search, ShoppingBag, Eye, Trash2, ArrowRight, CheckCircle2, Clock, Calendar, Check, AlertCircle } from 'lucide-react';

interface Props {
  salesOrders: SalesOrder[];
  customers: Customer[];
  products: Product[];
  onRefresh: () => void;
  onGenerateOP: (order: SalesOrder, productId: string, qty: number) => void;
}

export const SalesOrdersModule: React.FC<Props> = ({
  salesOrders,
  customers,
  products,
  onRefresh,
  onGenerateOP,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<SalesOrder | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([]);

  // Item being added
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState<number>(10);

  const openCreateModal = () => {
    setCustomerId(customers[0]?.id || '');
    const in10Days = new Date();
    in10Days.setDate(in10Days.getDate() + 10);
    setDeliveryDate(in10Days.toISOString().split('T')[0]);
    setNotes('');
    setOrderItems([]);
    setSelectedProductId(products[0]?.id || '');
    setItemQuantity(10);
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    if (!selectedProductId || itemQuantity <= 0) return;
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    const existingIdx = orderItems.findIndex(i => i.productId === selectedProductId);
    if (existingIdx >= 0) {
      const copy = [...orderItems];
      copy[existingIdx].quantity += itemQuantity;
      setOrderItems(copy);
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: prod.id,
          quantity: itemQuantity,
          unitPrice: prod.sellingPrice || 100,
        },
      ]);
    }
    setItemQuantity(10);
  };

  const handleRemoveItem = (prodId: string) => {
    setOrderItems(orderItems.filter(i => i.productId !== prodId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      alert('Adicione pelo menos um produto ao pedido.');
      return;
    }

    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const nextNumber = `PED-${new Date().getFullYear()}-${String(salesOrders.length + 1).padStart(2, '0')}`;
    const itemsFormatted = orderItems.map(item => {
      const prod = products.find(p => p.id === item.productId)!;
      return {
        productId: prod.id,
        productName: prod.name,
        productCode: prod.code,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      };
    });

    const totalValue = itemsFormatted.reduce((acc, i) => acc + i.totalPrice, 0);

    StorageService.addSalesOrder({
      orderNumber: nextNumber,
      customerId: customer.id,
      customerName: customer.name,
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate,
      items: itemsFormatted,
      totalValue,
      status: 'pendente',
      notes,
    });

    setIsModalOpen(false);
    onRefresh();
  };

  const handleDelete = (id: string, num: string) => {
    if (confirm(`Deseja excluir o pedido ${num}?`)) {
      StorageService.deleteSalesOrder(id);
      onRefresh();
    }
  };

  const handleStatusChange = (order: SalesOrder, newStatus: SalesOrderStatus) => {
    StorageService.updateSalesOrder({
      ...order,
      status: newStatus,
    });
    onRefresh();
  };

  const filteredOrders = salesOrders.filter(so => {
    const matchesSearch = so.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      so.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' ? true : so.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: SalesOrderStatus) => {
    switch (status) {
      case 'pendente':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Pendente</span>;
      case 'em_producao':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Em Produção</span>;
      case 'concluido':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Concluído</span>;
      case 'entregue':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">Entregue</span>;
      default:
        return <span className="text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-slate-700" />
            Gestão de Pedidos de Venda
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Carteira de pedidos, prazos de entrega e disparo de Ordens de Produção (OP) diretas.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Pedido de Venda
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por número do pedido ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="todos">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="em_producao">Em Produção</option>
            <option value="concluido">Concluído</option>
            <option value="entregue">Entregue</option>
          </select>
        </div>
      </div>

      {/* Sales Orders Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4 w-28">Nº Pedido</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4 w-32">Data Emissão</th>
                <th className="py-3 px-4 w-32">Data Entrega</th>
                <th className="py-3 px-4">Itens do Pedido</th>
                <th className="py-3 px-4 text-right w-28">Valor Total</th>
                <th className="py-3 px-4 text-center w-28">Status</th>
                <th className="py-3 px-4 text-right w-44">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(so => (
                  <tr key={so.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{so.orderNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{so.customerName}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{so.orderDate}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">{so.deliveryDate}</td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        {so.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700">
                            <span className="font-mono font-bold text-slate-900">{item.quantity}x</span>
                            <span className="truncate max-w-[200px]">{item.productName}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      R$ {so.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(so.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick action: Emissão de OP direto para o item */}
                        {so.status !== 'concluido' && so.status !== 'entregue' && so.items.length > 0 && (
                          <button
                            onClick={() => onGenerateOP(so, so.items[0].productId, so.items[0].quantity)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-[11px] font-semibold transition-colors"
                            title="Gerar Ordem de Produção"
                          >
                            <span>Gerar OP</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {so.status === 'concluido' && (
                          <button
                            onClick={() => handleStatusChange(so, 'entregue')}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-[11px] font-semibold transition-colors"
                          >
                            Entregar
                          </button>
                        )}

                        <button
                          onClick={() => setViewingOrder(so)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          title="Detalhes"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(so.id, so.orderNumber)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Nenhum pedido de venda encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar Pedido */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                Criar Novo Pedido de Venda
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cliente *</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  >
                    <option value="">Selecione o cliente...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data Prometida de Entrega *</label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Add item box */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-2">Adicionar Itens ao Pedido</label>
                <div className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-[220px]">
                    <label className="block text-[11px] text-slate-600 mb-1">Produto Fabricado</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.code} - {p.name} (R$ {p.sellingPrice.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <label className="block text-[11px] text-slate-600 mb-1">Quantidade</label>
                    <input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded transition-colors"
                  >
                    + Adicionar
                  </button>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="border border-slate-200 rounded-md overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Item / Produto</th>
                      <th className="py-2 px-3 text-right">Qtd</th>
                      <th className="py-2 px-3 text-right">Preço Unit.</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                      <th className="py-2 px-3 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orderItems.length > 0 ? (
                      orderItems.map((item, idx) => {
                        const prod = products.find(p => p.id === item.productId);
                        if (!prod) return null;
                        const sub = item.quantity * item.unitPrice;
                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3">
                              <span className="font-semibold text-slate-900">{prod.name}</span>
                              <span className="text-[11px] text-slate-500 font-mono block">{prod.code}</span>
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">{item.quantity} {prod.unit}</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-600">R$ {item.unitPrice.toFixed(2)}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">R$ {sub.toFixed(2)}</td>
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.productId)}
                                className="text-slate-400 hover:text-rose-600"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                          Nenhum produto adicionado ao pedido ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações do Pedido</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instruções de entrega, condições comerciais ou especificações especiais..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
                >
                  Confirmar e Salvar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes do Pedido */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Pedido {viewingOrder.orderNumber}</h3>
                <p className="text-xs text-slate-300">{viewingOrder.customerName}</p>
              </div>
              <button onClick={() => setViewingOrder(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Emissão:</span>
                  <span className="font-mono font-bold text-slate-800">{viewingOrder.orderDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Entrega Prometida:</span>
                  <span className="font-mono font-bold text-slate-800">{viewingOrder.deliveryDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status:</span>
                  <span>{getStatusBadge(viewingOrder.status)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Valor Total:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    R$ {viewingOrder.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">Itens Solicitados</h4>
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Produto</th>
                        <th className="py-2 px-3 text-right">Qtd</th>
                        <th className="py-2 px-3 text-right">Unitário</th>
                        <th className="py-2 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewingOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3">
                            <span className="font-semibold text-slate-900">{item.productName}</span>
                            <span className="font-mono text-slate-500 block text-[11px]">{item.productCode}</span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">{item.quantity}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600">R$ {item.unitPrice.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">R$ {item.totalPrice.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {viewingOrder.notes && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
                  <span className="font-semibold text-slate-700 block mb-0.5">Observações:</span>
                  <p className="text-slate-600">{viewingOrder.notes}</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewingOrder(null)}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 transition-colors"
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
