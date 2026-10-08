import React, { useState } from 'react';
import {
  ProductionOrder,
  Product,
  RawMaterial,
  Customer,
  CompanySettings,
} from '../../types/erp';
import {
  FileText,
  Printer,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  productionOrders: ProductionOrder[];
  products: Product[];
  materials: RawMaterial[];
  customers: Customer[];
  companySettings: CompanySettings;
  onOpenPrintOP: (op: ProductionOrder) => void;
}

export const ReportsModule: React.FC<Props> = ({
  productionOrders,
  products,
  materials,
  customers,
  companySettings,
  onOpenPrintOP,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [productFilter, setProductFilter] = useState<string>('todos');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');

  // Filtered dataset
  const filteredOrders = productionOrders.filter(op => {
    const matchesStatus = statusFilter === 'todos' ? true : op.status === statusFilter;
    const matchesProduct = productFilter === 'todos' ? true : op.productId === productFilter;
    const matchesStart = startDateFilter ? op.startDate >= startDateFilter : true;
    const matchesEnd = endDateFilter ? op.expectedEndDate <= endDateFilter : true;
    return matchesStatus && matchesProduct && matchesStart && matchesEnd;
  });

  // KPIs
  const totalOps = filteredOrders.length;
  const completedOps = filteredOrders.filter(o => o.status === 'concluida').length;
  const inProgressOps = filteredOrders.filter(o => o.status === 'em_producao' || o.status === 'preparacao').length;
  const plannedOps = filteredOrders.filter(o => o.status === 'planejada').length;

  const totalProducedUnits = filteredOrders.reduce((acc, o) => acc + (o.producedQuantity || 0), 0);
  const totalScrapUnits = filteredOrders.reduce((acc, o) => acc + (o.scrapQuantity || 0), 0);
  const scrapRate = totalProducedUnits + totalScrapUnits > 0
    ? ((totalScrapUnits / (totalProducedUnits + totalScrapUnits)) * 100).toFixed(1)
    : '0.0';

  const totalPlannedHours = filteredOrders.reduce((acc, o) => acc + (o.totalPlannedMinutes / 60), 0);
  const totalActualHours = filteredOrders.reduce((acc, o) => acc + ((o.actualMinutesSpent || 0) / 60), 0);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Código OP',
      'Produto',
      'Código Produto',
      'Cliente',
      'Pedido Venda',
      'Qtd Planejada',
      'Qtd Produzida',
      'Refugo',
      'Horas Previstas',
      'Horas Reais',
      'Início',
      'Previsão Término',
      'Data Conclusão',
      'Status',
      'Responsável Técnico',
    ];

    const rows = filteredOrders.map(op => [
      op.code,
      `"${op.productName}"`,
      op.productCode,
      `"${op.customerName || 'Estoque'}"`,
      op.salesOrderNumber || '',
      op.targetQuantity,
      op.producedQuantity || 0,
      op.scrapQuantity || 0,
      (op.totalPlannedMinutes / 60).toFixed(1),
      op.actualMinutesSpent ? (op.actualMinutesSpent / 60).toFixed(1) : '',
      op.startDate,
      op.expectedEndDate,
      op.completedDate || '',
      op.status,
      `"${op.responsibleTechnician}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_producao_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-slate-700" />
            Relatórios de Acompanhamento de Produção
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas de chão de fábrica, cumprimento de prazos, controle de perdas e emissão de relatórios oficiais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir Relatório (A4)
          </button>
        </div>
      </div>

      {/* Filter Bar (hidden on print) */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs print:hidden space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Filtros do Relatório</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status da Produção</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="todos">Todos os Status</option>
              <option value="concluida">Concluídas</option>
              <option value="em_producao">Em Produção</option>
              <option value="preparacao">Em Preparação</option>
              <option value="qualidade">Em Qualidade</option>
              <option value="planejada">Aguardando Início</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Produto Fabricado</label>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="todos">Todos os Produtos</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Início a partir de</label>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Término até</label>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Official Printable Report Container */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 print:p-0 print:border-none shadow-2xs space-y-6">
        {/* Printable Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-950 uppercase">{companySettings.companyName}</h1>
            <p className="text-xs text-slate-600">
              CNPJ: {companySettings.cnpj} · {companySettings.cityState} · Tel: {companySettings.phone}
            </p>
            <p className="text-xs font-semibold text-slate-800 mt-1">
              RELATÓRIO CONSOLIDADO DE PRODUÇÃO & APONTAMENTO DE PCP
            </p>
          </div>

          <div className="text-right border-l-2 border-slate-200 pl-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Responsável Técnico</span>
            <div className="text-xs font-bold text-slate-900">{companySettings.responsibleName}</div>
            <div className="text-[11px] text-slate-600">{companySettings.responsibleRole}</div>
            <div className="text-[10px] font-mono text-slate-500">{companySettings.responsibleCouncil}</div>
            <div className="text-[10px] text-slate-400 mt-1">
              Emissão: {new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[11px] text-slate-500 block">Total de OPs no Filtro</span>
            <span className="text-xl font-bold font-mono text-slate-900">{totalOps}</span>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {completedOps} concluídas · {inProgressOps} ativas
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[11px] text-slate-500 block">Peças Aprovadas (Boas)</span>
            <span className="text-xl font-bold font-mono text-emerald-700">{totalProducedUnits} un</span>
            <div className="text-[10px] text-slate-500 mt-0.5">Entrada em produto acabado</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[11px] text-slate-500 block">Índice de Perdas / Refugos</span>
            <span className="text-xl font-bold font-mono text-rose-600">{scrapRate}%</span>
            <div className="text-[10px] text-slate-500 mt-0.5">{totalScrapUnits} peças refugadas</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[11px] text-slate-500 block">Horas Realizadas vs Previstas</span>
            <span className="text-xl font-bold font-mono text-slate-900">{totalActualHours.toFixed(1)}h</span>
            <div className="text-[10px] text-slate-500 mt-0.5">Previsto: {totalPlannedHours.toFixed(1)}h</div>
          </div>
        </div>

        {/* Detailed Orders Table */}
        <div className="border border-slate-200 rounded overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Produto</th>
                <th className="py-2.5 px-3">Cliente / Pedido</th>
                <th className="py-2.5 px-3 text-right">Planejado</th>
                <th className="py-2.5 px-3 text-right">Produzido</th>
                <th className="py-2.5 px-3 text-right">Refugo</th>
                <th className="py-2.5 px-3 text-center">Período</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center print:hidden w-16">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(op => (
                  <tr key={op.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">{op.code}</td>
                    <td className="py-2 px-3">
                      <span className="font-semibold text-slate-900">{op.productName}</span>
                      <span className="text-[10px] text-slate-500 font-mono block">{op.productCode}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-700">
                      <div>{op.customerName || 'Estoque Interno'}</div>
                      {op.salesOrderNumber && (
                        <div className="text-[10px] text-slate-400 font-mono">{op.salesOrderNumber}</div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{op.targetQuantity} un</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">{op.producedQuantity || 0} un</td>
                    <td className="py-2 px-3 text-right font-mono text-rose-600">{op.scrapQuantity || 0} un</td>
                    <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-600">
                      {op.startDate} ~ {op.expectedEndDate}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-700">
                        {op.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center print:hidden">
                      <button
                        onClick={() => onOpenPrintOP(op)}
                        className="text-[11px] text-slate-600 hover:text-slate-900 underline"
                      >
                        Ficha
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-400">
                    Nenhum registro encontrado no período selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Technical Responsible Official Signatures Block for Reports */}
        <div className="border border-slate-300 rounded p-4 bg-slate-50/50 mt-6">
          <div className="grid grid-cols-2 gap-8 items-end">
            <div className="text-center">
              <div className="border-b border-slate-400 pb-1 mb-1">
                <span className="text-xs text-transparent select-none">Assinatura</span>
              </div>
              <div className="text-xs font-medium text-slate-700">Gerência de Operações Industriais</div>
              <div className="text-[10px] text-slate-400">Data: ____/____/2026</div>
            </div>

            <div className="text-center">
              <div className="border-b border-slate-400 pb-1 mb-1">
                <span className="text-xs font-bold text-slate-950 uppercase">{companySettings.responsibleName}</span>
              </div>
              <div className="text-xs font-semibold text-slate-900">
                {companySettings.responsibleRole}
              </div>
              <div className="text-[10px] font-mono text-slate-600">
                {companySettings.responsibleCouncil} · Responsável Técnico Titular
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
