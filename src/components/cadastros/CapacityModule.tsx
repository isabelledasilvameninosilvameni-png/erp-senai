import React, { useState } from 'react';
import { WorkCenter, ProductionOrder } from '../../types/erp';
import { StorageService } from '../../services/storage';
import { Plus, Edit2, Trash2, Gauge, Clock, Users, Cpu, Activity, AlertCircle } from 'lucide-react';

interface Props {
  workCenters: WorkCenter[];
  productionOrders: ProductionOrder[];
  onRefresh: () => void;
}

export const CapacityModule: React.FC<Props> = ({
  workCenters,
  productionOrders,
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<WorkCenter | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');
  const [dailyHours, setDailyHours] = useState<number>(8);
  const [shifts, setShifts] = useState<number>(1);
  const [operatorsCount, setOperatorsCount] = useState<number>(2);
  const [efficiencyPercent, setEfficiencyPercent] = useState<number>(85);

  const openCreateModal = () => {
    setEditingCenter(null);
    const nextCode = `POSTO-${String(workCenters.length + 1).padStart(2, '0')}`;
    setCode(nextCode);
    setName('');
    setSector('Usinagem');
    setDailyHours(8);
    setShifts(1);
    setOperatorsCount(2);
    setEfficiencyPercent(85);
    setIsModalOpen(true);
  };

  const openEditModal = (wc: WorkCenter) => {
    setEditingCenter(wc);
    setCode(wc.code);
    setName(wc.name);
    setSector(wc.sector);
    setDailyHours(wc.dailyHours);
    setShifts(wc.shifts);
    setOperatorsCount(wc.operatorsCount);
    setEfficiencyPercent(wc.efficiencyPercent);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Deseja remover o posto de trabalho "${name}"?`)) {
      StorageService.deleteWorkCenter(id);
      onRefresh();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCenter) {
      StorageService.updateWorkCenter({
        ...editingCenter,
        code,
        name,
        sector,
        dailyHours: Number(dailyHours),
        shifts: Number(shifts),
        operatorsCount: Number(operatorsCount),
        efficiencyPercent: Number(efficiencyPercent),
      });
    } else {
      StorageService.addWorkCenter({
        code,
        name,
        sector,
        dailyHours: Number(dailyHours),
        shifts: Number(shifts),
        operatorsCount: Number(operatorsCount),
        efficiencyPercent: Number(efficiencyPercent),
        active: true,
      });
    }

    setIsModalOpen(false);
    onRefresh();
  };

  // Total factory weekly capacity
  const totalWeeklyHours = workCenters.reduce((acc, wc) => {
    const dailyTotal = wc.dailyHours * wc.shifts;
    const weeklyGross = dailyTotal * 5; // 5 dias úteis por semana
    const effectiveWeekly = weeklyGross * (wc.efficiencyPercent / 100);
    return acc + effectiveWeekly;
  }, 0);

  // Active production hours allocated to work centers
  const activeOps = productionOrders.filter(o => o.status !== 'concluida' && o.status !== 'cancelada');
  const totalActivePlannedHours = activeOps.reduce((acc, o) => acc + (o.totalPlannedMinutes / 60), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Gauge className="w-6 h-6 text-slate-700" />
            Capacidade Produtiva & Postos de Trabalho
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mapeamento de postos operacionais, horas nominais por turno, eficiência e carga de trabalho fabril.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Posto de Trabalho
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Capacidade Semanal Efetiva</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {totalWeeklyHours.toFixed(0)} <span className="text-sm font-normal text-slate-500">horas/sem</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Considerando fator de eficiência histórica de cada posto
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Carga Atual em Carteira (OPs)</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600">
            {totalActivePlannedHours.toFixed(1)} <span className="text-sm font-normal text-slate-500">horas alocadas</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Soma das OPs ativas (planejadas, setup e em andamento)
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Taxa Geral de Ocupação</span>
            <Gauge className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {totalWeeklyHours > 0 ? ((totalActivePlannedHours / totalWeeklyHours) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Demanda programada vs capacidade semanal
          </div>
        </div>
      </div>

      {/* Work Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workCenters.map((wc) => {
          const nominalDailyHours = wc.dailyHours * wc.shifts;
          const weeklyEffectiveHours = (nominalDailyHours * 5 * (wc.efficiencyPercent / 100));

          // Calculate hours allocated specifically to this work center
          const wcOps = activeOps.filter(o => o.workCenterId === wc.id);
          const wcAllocatedHours = wcOps.reduce((acc, o) => acc + (o.totalPlannedMinutes / 60), 0);
          const occupancyRate = weeklyEffectiveHours > 0 ? (wcAllocatedHours / weeklyEffectiveHours) * 100 : 0;

          return (
            <div
              key={wc.id}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-500">{wc.code}</span>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">{wc.name}</h3>
                    <span className="text-xs text-slate-500">Setor: {wc.sector}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(wc)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(wc.id, wc.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 text-xs mb-4">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Turnos / Dia</span>
                    <span className="font-bold font-mono text-slate-800">
                      {wc.shifts} {wc.shifts === 1 ? 'turno' : 'turnos'} ({wc.dailyHours}h)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Operadores</span>
                    <span className="font-bold font-mono text-slate-800 flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-500" />
                      {wc.operatorsCount} pessoas
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Eficiência</span>
                    <span className="font-bold font-mono text-emerald-700">
                      {wc.efficiencyPercent}%
                    </span>
                  </div>
                </div>

                {/* Capacity breakdown */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="flex justify-between">
                    <span>Capacidade Efetiva (5 dias):</span>
                    <span className="font-mono font-bold text-slate-900">{weeklyEffectiveHours.toFixed(1)} h/semana</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carga Programada em OPs:</span>
                    <span className="font-mono font-bold text-amber-700">{wcAllocatedHours.toFixed(1)} h ({wcOps.length} OPs)</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-medium text-slate-600">Ocupação do Posto</span>
                    <span className="font-mono font-bold text-slate-900">{occupancyRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        occupancyRate > 100
                          ? 'bg-rose-500'
                          : occupancyRate > 75
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>
                  {occupancyRate > 100 && (
                    <div className="flex items-center gap-1 text-[11px] text-rose-600 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      Sobrecarga identificada! Necessário hora extra ou reagendamento.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingCenter ? 'Editar Posto de Trabalho' : 'Cadastrar Novo Posto de Trabalho'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Código *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Posto / Linha *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Torno CNC Mazak 01"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Setor / Seção Fabril *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Usinagem, Caldeiraria, Montagem..."
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horas por Turno *</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    required
                    value={dailyHours}
                    onChange={(e) => setDailyHours(parseInt(e.target.value) || 8)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Número de Turnos *</label>
                  <select
                    value={shifts}
                    onChange={(e) => setShifts(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  >
                    <option value={1}>1 Turno (8h/dia)</option>
                    <option value={2}>2 Turnos (16h/dia)</option>
                    <option value={3}>3 Turnos (24h/dia)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Operadores Alocados</label>
                  <input
                    type="number"
                    min="1"
                    value={operatorsCount}
                    onChange={(e) => setOperatorsCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Eficiência Estimada (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={efficiencyPercent}
                    onChange={(e) => setEfficiencyPercent(parseInt(e.target.value) || 85)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
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
                  {editingCenter ? 'Salvar Alterações' : 'Cadastrar Posto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
