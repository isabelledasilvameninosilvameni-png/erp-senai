import React, { useState } from 'react';
import {
  ProductionOrder,
  ProductionOrderStatus,
  Product,
  RawMaterial,
  WorkCenter,
  SalesOrder,
  CompanySettings,
} from '../../types/erp';
import { StorageService } from '../../services/storage';
import {
  Plus,
  Search,
  Filter,
  Printer,
  CheckCircle,
  Play,
  Wrench,
  ShieldCheck,
  Check,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  List,
  Eye,
  Trash2,
  Calendar,
  AlertOctagon,
} from 'lucide-react';

interface Props {
  productionOrders: ProductionOrder[];
  products: Product[];
  materials: RawMaterial[];
  workCenters: WorkCenter[];
  salesOrders: SalesOrder[];
  companySettings: CompanySettings;
  onRefresh: () => void;
  onOpenPrintSheet: (op: ProductionOrder) => void;
  initialNewOPParams?: { salesOrder: SalesOrder; productId: string; qty: number } | null;
  onClearInitialNewOPParams?: () => void;
}

export const ProductionOrdersModule: React.FC<Props> = ({
  productionOrders,
  products,
  materials,
  workCenters,
  salesOrders,
  companySettings,
  onRefresh,
  onOpenPrintSheet,
  initialNewOPParams,
  onClearInitialNewOPParams,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [selectedOPForCompletion, setSelectedOPForCompletion] = useState<ProductionOrder | null>(null);

  // Completion Form State (Baixa de OP)
  const [completionGoodQty, setCompletionGoodQty] = useState<number>(0);
  const [completionScrapQty, setCompletionScrapQty] = useState<number>(0);
  const [completionTimeMinutes, setCompletionTimeMinutes] = useState<number>(0);
  const [completionNotes, setCompletionNotes] = useState('');

  // Create Form State (Emissão de OP)
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedSalesOrderId, setSelectedSalesOrderId] = useState('');
  const [targetQuantity, setTargetQuantity] = useState<number>(10);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedEndDate, setExpectedEndDate] = useState('');
  const [workCenterId, setWorkCenterId] = useState('');
  const [priority, setPriority] = useState<'baixa' | 'normal' | 'alta' | 'urgente'>('normal');
  const [opNotes, setOpNotes] = useState('');

  // Check if initiated from Sales Order
  React.useEffect(() => {
    if (initialNewOPParams) {
      setSelectedSalesOrderId(initialNewOPParams.salesOrder.id);
      setSelectedProductId(initialNewOPParams.productId);
      setTargetQuantity(initialNewOPParams.qty);

      const in5Days = new Date();
      in5Days.setDate(in5Days.getDate() + 5);
      setExpectedEndDate(in5Days.toISOString().split('T')[0]);
      setStartDate(new Date().toISOString().split('T')[0]);
      setWorkCenterId(workCenters[0]?.id || '');
      setPriority('alta');
      setOpNotes(`Ordem gerada a partir do pedido ${initialNewOPParams.salesOrder.orderNumber}`);
      setIsCreateModalOpen(true);
      onClearInitialNewOPParams?.();
    }
  }, [initialNewOPParams]);

  const openCreateModal = () => {
    const defaultProd = products[0];
    setSelectedProductId(defaultProd?.id || '');
    setSelectedSalesOrderId('');
    setTargetQuantity(10);
    setStartDate(new Date().toISOString().split('T')[0]);

    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);
    setExpectedEndDate(in7Days.toISOString().split('T')[0]);
    setWorkCenterId(workCenters[0]?.id || '');
    setPriority('normal');
    setOpNotes('');
    setIsCreateModalOpen(true);
  };

  // Active product in create modal
  const activeProduct = products.find(p => p.id === selectedProductId);

  // Calculate required raw materials for the target quantity
  const requiredBOMItems = activeProduct
    ? activeProduct.bom.map(b => {
        const mat = materials.find(m => m.id === b.rawMaterialId);
        const requiredQty = Number((b.quantityPerUnit * targetQuantity).toFixed(2));
        const availableStock = mat?.currentStock || 0;
        const hasEnough = availableStock >= requiredQty;
        return {
          rawMaterialId: b.rawMaterialId,
          code: mat?.code || 'N/A',
          name: mat?.name || 'Insumo não encontrado',
          unit: mat?.unit || 'UN',
          unitCost: mat?.unitCost || 0,
          requiredQuantity: requiredQty,
          stockAvailable: availableStock,
          hasEnough,
        };
      })
    : [];

  const hasMissingMaterials = requiredBOMItems.some(i => !i.hasEnough);
  const totalPlannedMinutes = activeProduct ? activeProduct.cycleTimeMinutes * targetQuantity : 0;
  const plannedHours = (totalPlannedMinutes / 60).toFixed(1);

  const handleCreateOP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct || targetQuantity <= 0) return;

    const opCode = `OP-${new Date().getFullYear()}-${String(productionOrders.length + 1).padStart(3, '0')}`;
    const selectedSo = salesOrders.find(s => s.id === selectedSalesOrderId);
    const selectedWc = workCenters.find(w => w.id === workCenterId);

    const bomSnapshot = requiredBOMItems.map(item => ({
      rawMaterialId: item.rawMaterialId,
      rawMaterialCode: item.code,
      rawMaterialName: item.name,
      unit: item.unit,
      requiredQuantity: item.requiredQuantity,
      stockAvailableAtCreation: item.stockAvailable,
      unitCost: item.unitCost,
    }));

    StorageService.addProductionOrder({
      code: opCode,
      productId: activeProduct.id,
      productCode: activeProduct.code,
      productName: activeProduct.name,
      targetQuantity,
      producedQuantity: 0,
      scrapQuantity: 0,
      unitCycleMinutes: activeProduct.cycleTimeMinutes,
      totalPlannedMinutes,
      salesOrderId: selectedSo?.id,
      salesOrderNumber: selectedSo?.orderNumber,
      customerId: selectedSo?.customerId,
      customerName: selectedSo?.customerName,
      workCenterId: selectedWc?.id,
      workCenterName: selectedWc?.name,
      startDate,
      expectedEndDate,
      status: 'planejada',
      responsibleTechnician: companySettings.responsibleName,
      responsibleCouncil: companySettings.responsibleCouncil,
      priority,
      notes: opNotes,
      bomSnapshot,
      initialNote: `Ordem emitida por ${companySettings.responsibleName}.`,
    });

    setIsCreateModalOpen(false);
    onRefresh();
  };

  // Status transitions
  const handleAdvanceStatus = (op: ProductionOrder) => {
    let nextStatus: ProductionOrderStatus = op.status;
    if (op.status === 'planejada') nextStatus = 'preparacao';
    else if (op.status === 'preparacao') nextStatus = 'em_producao';
    else if (op.status === 'em_producao') nextStatus = 'qualidade';
    else if (op.status === 'qualidade') {
      openCompletionModal(op);
      return;
    }

    StorageService.updateProductionOrderStatus(
      op.id,
      nextStatus,
      companySettings.responsibleName,
      `Etapa avançada para ${nextStatus.toUpperCase()}`
    );
    onRefresh();
  };

  const openCompletionModal = (op: ProductionOrder) => {
    setSelectedOPForCompletion(op);
    setCompletionGoodQty(op.targetQuantity);
    setCompletionScrapQty(0);
    setCompletionTimeMinutes(op.totalPlannedMinutes);
    setCompletionNotes('');
    setIsCompletionModalOpen(true);
  };

  const handleConfirmCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOPForCompletion) return;

    const result = StorageService.completeProductionOrder({
      opId: selectedOPForCompletion.id,
      producedQuantity: Number(completionGoodQty),
      scrapQuantity: Number(completionScrapQty),
      actualMinutesSpent: Number(completionTimeMinutes),
      user: companySettings.responsibleName,
      notes: completionNotes,
    });

    if (result.success) {
      setIsCompletionModalOpen(false);
      setSelectedOPForCompletion(null);
      onRefresh();
    } else {
      alert(result.message);
    }
  };

  const handleDeleteOP = (id: string, code: string) => {
    if (confirm(`Deseja remover a ordem de produção ${code}?`)) {
      StorageService.deleteProductionOrder(id);
      onRefresh();
    }
  };

  const filteredOrders = productionOrders.filter(op => {
    const matchesSearch = op.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (op.customerName && op.customerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'todos' ? true : op.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusText = (status: ProductionOrderStatus) => {
    switch (status) {
      case 'planejada': return 'Aguardando Início';
      case 'preparacao': return 'Em Preparação (Setup)';
      case 'em_producao': return 'Em Produção';
      case 'qualidade': return 'Controle de Qualidade';
      case 'concluida': return 'Concluída';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const getStatusBadge = (status: ProductionOrderStatus) => {
    switch (status) {
      case 'planejada':
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"><Clock className="w-3 h-3 text-slate-500" /> Aguardando</span>;
      case 'preparacao':
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200"><Wrench className="w-3 h-3 text-amber-600" /> Preparação</span>;
      case 'em_producao':
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200"><Play className="w-3 h-3 text-blue-600 fill-blue-600" /> Em Produção</span>;
      case 'qualidade':
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-800 border border-purple-200"><ShieldCheck className="w-3 h-3 text-purple-600" /> Qualidade</span>;
      case 'concluida':
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"><CheckCircle className="w-3 h-3 text-emerald-600" /> Concluída</span>;
      default:
        return <span className="text-slate-600">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return <span className="text-[10px] font-bold uppercase text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Urgente</span>;
      case 'alta':
        return <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Alta</span>;
      default:
        return <span className="text-[10px] font-medium text-slate-500 uppercase">{priority}</span>;
    }
  };

  // Kanban status columns
  const kanbanColumns: { id: ProductionOrderStatus; label: string; icon: any }[] = [
    { id: 'planejada', label: '1. Aguardando / Planejada', icon: Clock },
    { id: 'preparacao', label: '2. Em Preparação (Setup)', icon: Wrench },
    { id: 'em_producao', label: '3. Em Produção', icon: Play },
    { id: 'qualidade', label: '4. Controle de Qualidade', icon: ShieldCheck },
    { id: 'concluida', label: '5. Concluída (Baixada)', icon: CheckCircle },
  ];

  return (
    <div className="space-y-5">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-slate-700" />
            Ordens de Produção (PCP & Chão de Fábrica)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Emissão de OPs, controle de tempos, verificação de insumos e baixa com movimentação de estoque.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Visualização em Lista"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Quadro Kanban de Produção"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Emitir Nova OP
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código da OP, produto ou cliente..."
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
            <option value="todos">Todos os Status</option>
            <option value="planejada">Aguardando Início</option>
            <option value="preparacao">Em Preparação</option>
            <option value="em_producao">Em Produção</option>
            <option value="qualidade">Controle de Qualidade</option>
            <option value="concluida">Concluída</option>
          </select>
        </div>
      </div>

      {/* View: Table Mode */}
      {viewMode === 'table' ? (
        <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-28">Nº da OP</th>
                  <th className="py-3 px-4">Produto Fabricado</th>
                  <th className="py-3 px-4 w-28 text-center">Planejado</th>
                  <th className="py-3 px-4 w-28 text-center">Concluído</th>
                  <th className="py-3 px-4 w-32">Tempo Previsto</th>
                  <th className="py-3 px-4 w-36">Posto / Linha</th>
                  <th className="py-3 px-4 text-center w-36">Status</th>
                  <th className="py-3 px-4 text-right w-48">Ações de Chão de Fábrica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(op => {
                    const isCompleted = op.status === 'concluida';
                    const progressPercent = isCompleted
                      ? 100
                      : op.targetQuantity > 0
                      ? Math.min(100, Math.round(((op.producedQuantity || 0) / op.targetQuantity) * 100))
                      : 0;

                    return (
                      <tr key={op.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-slate-900">{op.code}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {op.salesOrderNumber || 'Avulsa'}
                          </div>
                          {getPriorityBadge(op.priority)}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{op.productName}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span>Código: {op.productCode}</span>
                            {op.customerName && (
                              <span>· Cliente: {op.customerName}</span>
                            )}
                          </div>
                          {/* Progress bar */}
                          <div className="w-48 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                            <div
                              className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                          {op.targetQuantity} un
                        </td>

                        <td className="py-3 px-4 text-center font-mono">
                          {isCompleted ? (
                            <div className="font-bold text-emerald-700">
                              {op.producedQuantity} un boas
                              {op.scrapQuantity > 0 && (
                                <span className="text-[10px] text-rose-500 block">({op.scrapQuantity} refugo)</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500">{op.producedQuantity || 0} un</span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-700">
                          <div>{(op.totalPlannedMinutes / 60).toFixed(1)}h previstas</div>
                          {op.actualMinutesSpent !== undefined && (
                            <div className="text-[11px] text-slate-500">{(op.actualMinutesSpent / 60).toFixed(1)}h reais</div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-700">
                          <span className="truncate max-w-[140px] block font-medium">
                            {op.workCenterName || 'Geral'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(op.status)}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Advance Step Action */}
                            {!isCompleted && op.status !== 'cancelada' && (
                              <button
                                onClick={() => handleAdvanceStatus(op)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded transition-colors ${
                                  op.status === 'qualidade'
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                                }`}
                                title={op.status === 'qualidade' ? 'Baixar / Concluir Produção' : 'Avançar Etapa'}
                              >
                                {op.status === 'qualidade' ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Baixar OP</span>
                                  </>
                                ) : (
                                  <>
                                    <span>Avançar</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </>
                                )}
                              </button>
                            )}

                            {/* Print Document Button */}
                            <button
                              onClick={() => onOpenPrintSheet(op)}
                              className="p-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                              title="Imprimir Ficha de Chão de Fábrica (A4)"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteOP(op.id, op.code)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Nenhuma ordem de produção encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* View: Kanban Mode */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          {kanbanColumns.map(col => {
            const columnOrders = filteredOrders.filter(o => o.status === col.id);
            const Icon = col.icon;

            return (
              <div key={col.id} className="bg-slate-100/80 rounded-xl p-3 border border-slate-200 flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Icon className="w-3.5 h-3.5 text-slate-600" />
                    <span>{col.label}</span>
                  </div>
                  <span className="text-xs font-mono font-bold px-1.5 py-0.2 bg-white rounded border border-slate-200 text-slate-700">
                    {columnOrders.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-0.5">
                  {columnOrders.map(op => (
                    <div
                      key={op.id}
                      className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono text-[11px] font-bold text-slate-900 block">{op.code}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{op.salesOrderNumber || 'Avulsa'}</span>
                        </div>
                        {getPriorityBadge(op.priority)}
                      </div>

                      <div>
                        <div className="font-semibold text-xs text-slate-900 leading-tight">{op.productName}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Meta: <strong>{op.targetQuantity} un</strong> · {(op.totalPlannedMinutes / 60).toFixed(1)}h
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100 flex items-center justify-between">
                        <span className="truncate max-w-[120px]">{op.workCenterName || 'Geral'}</span>
                        <span>{op.expectedEndDate}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <button
                          onClick={() => onOpenPrintSheet(op)}
                          className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1"
                          title="Ficha Oficial"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Ficha</span>
                        </button>

                        {op.status !== 'concluida' && (
                          <button
                            onClick={() => handleAdvanceStatus(op)}
                            className="text-[11px] font-semibold text-slate-900 hover:text-amber-600 flex items-center gap-1"
                          >
                            <span>{op.status === 'qualidade' ? 'Baixar' : 'Avançar'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {columnOrders.length === 0 && (
                    <div className="py-6 text-center text-slate-400 text-xs italic">
                      Vazio
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Emissão de Nova Ordem de Produção */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Emissão de Ordem de Produção (OP)
                </h3>
                <p className="text-xs text-slate-300">
                  Responsável Técnico: {companySettings.responsibleName} ({companySettings.responsibleCouncil})
                </p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateOP} className="p-6 space-y-4">
              {/* Product and Sales Order linking */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Produto a Fabricar *</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vincular a Pedido de Venda (Opcional)</label>
                  <select
                    value={selectedSalesOrderId}
                    onChange={(e) => setSelectedSalesOrderId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  >
                    <option value="">Produção Para Estoque (Avulsa)</option>
                    {salesOrders
                      .filter(s => s.status !== 'concluido' && s.status !== 'entregue')
                      .map(s => (
                        <option key={s.id} value={s.id}>
                          {s.orderNumber} - {s.customerName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Quantities, Timing and Posto */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Qtd. Planejada *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={targetQuantity}
                    onChange={(e) => setTargetQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono font-bold focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tempo Total Previsto</label>
                  <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-xs font-mono text-slate-800">
                    {plannedHours} horas ({totalPlannedMinutes} min)
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Posto / Linha de Trabalho *</label>
                  <select
                    value={workCenterId}
                    onChange={(e) => setWorkCenterId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  >
                    {workCenters.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data Início Previsto</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data Término Previsto</label>
                  <input
                    type="date"
                    required
                    value={expectedEndDate}
                    onChange={(e) => setExpectedEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prioridade</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>
              </div>

              {/* Bill of Materials verification table */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-slate-600" />
                    Verificação Automática de Insumos (Ficha Técnica vs Estoque)
                  </span>
                  {hasMissingMaterials ? (
                    <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Atenção: Saldo insuficiente para alguns insumos!
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Insumos 100% disponíveis no Almoxarifado
                    </span>
                  )}
                </div>

                <div className="border border-slate-200 rounded-md overflow-hidden max-h-44 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold">
                      <tr>
                        <th className="py-2 px-3">Código</th>
                        <th className="py-2 px-3">Matéria-Prima</th>
                        <th className="py-2 px-3 text-right">Necessário</th>
                        <th className="py-2 px-3 text-right">Saldo Atual</th>
                        <th className="py-2 px-3 text-center w-28">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {requiredBOMItems.map((item, idx) => (
                        <tr key={idx} className={!item.hasEnough ? 'bg-rose-50/50' : ''}>
                          <td className="py-2 px-3 font-mono text-slate-600">{item.code}</td>
                          <td className="py-2 px-3 font-medium text-slate-900">{item.name}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                            {item.requiredQuantity} {item.unit}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600">
                            {item.stockAvailable} {item.unit}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {item.hasEnough ? (
                              <span className="text-[10px] text-emerald-700 font-semibold uppercase">Disponível</span>
                            ) : (
                              <span className="text-[10px] text-rose-600 font-bold uppercase">Falta Insumo</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notas / Instruções Especiais de Produção</label>
                <textarea
                  rows={2}
                  value={opNotes}
                  onChange={(e) => setOpNotes(e.target.value)}
                  placeholder="Informações para os operadores de chão de fábrica, lotes, tolerâncias..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
                >
                  Emitir Ordem de Produção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Baixa / Conclusão de Ordem de Produção */}
      {isCompletionModalOpen && selectedOPForCompletion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Baixa de Produção & Movimentação de Estoque
                </h3>
                <p className="text-xs text-slate-300">
                  {selectedOPForCompletion.code} - {selectedOPForCompletion.productName}
                </p>
              </div>
              <button onClick={() => setIsCompletionModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConfirmCompletion} className="p-6 space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Efeitos automáticos ao confirmar a baixa:
                </div>
                <ul className="list-disc list-inside text-emerald-800 text-[11px] space-y-0.5">
                  <li>Baixa automática no saldo das matérias-primas consumidas (proporcional ao lote)</li>
                  <li>Entrada da quantidade boa produzida no estoque de produtos acabados</li>
                  <li>Conclusão do status da OP e atualização do Pedido de Venda associado</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Qtd. Boas Aprovadas (Peças) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={completionGoodQty}
                    onChange={(e) => setCompletionGoodQty(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono font-bold text-emerald-700 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">Planejado: {selectedOPForCompletion.targetQuantity} un</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Perdas / Refugos (Peças)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={completionScrapQty}
                    onChange={(e) => setCompletionScrapQty(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono text-rose-600 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500">Peças danificadas ou refugadas</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tempo Real Gasto no Processo (minutos) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={completionTimeMinutes}
                    onChange={(e) => setCompletionTimeMinutes(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
                    = {(completionTimeMinutes / 60).toFixed(1)} horas
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parecer do Responsável Técnico / Qualidade
                </label>
                <textarea
                  rows={2}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Lote aprovado conforme especificações técnicas do projeto..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-200">
                Baixa assinada por: <strong className="text-slate-800">{companySettings.responsibleName}</strong> ({companySettings.responsibleCouncil})
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCompletionModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
                >
                  Confirmar Baixa & Atualizar Estoque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
