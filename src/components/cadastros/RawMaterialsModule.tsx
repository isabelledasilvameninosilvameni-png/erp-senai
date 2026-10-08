import React, { useState } from 'react';
import { RawMaterial, Supplier, UnitOfMeasure } from '../../types/erp';
import { StorageService } from '../../services/storage';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Package, Check, ArrowUpDown } from 'lucide-react';

interface Props {
  materials: RawMaterial[];
  suppliers: Supplier[];
  onRefresh: () => void;
}

export const RawMaterialsModule: React.FC<Props> = ({ materials, suppliers, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<UnitOfMeasure>('KG');
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(0);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [supplierId, setSupplierId] = useState('');
  const [location, setLocation] = useState('');

  const openCreateModal = () => {
    setEditingMaterial(null);
    const nextCode = `MP-${String(materials.length + 1).padStart(3, '0')}`;
    setCode(nextCode);
    setName('');
    setUnit('KG');
    setCurrentStock(0);
    setMinStock(10);
    setUnitCost(0);
    setSupplierId(suppliers[0]?.id || '');
    setLocation('Almoxarifado Geral');
    setIsModalOpen(true);
  };

  const openEditModal = (mat: RawMaterial) => {
    setEditingMaterial(mat);
    setCode(mat.code);
    setName(mat.name);
    setUnit(mat.unit);
    setCurrentStock(mat.currentStock);
    setMinStock(mat.minStock);
    setUnitCost(mat.unitCost);
    setSupplierId(mat.supplierId || '');
    setLocation(mat.location || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, matName: string) => {
    if (confirm(`Deseja realmente remover a matéria-prima "${matName}"?`)) {
      StorageService.deleteMaterial(id);
      onRefresh();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingMaterial) {
      StorageService.updateMaterial({
        ...editingMaterial,
        code,
        name,
        unit,
        currentStock: Number(currentStock),
        minStock: Number(minStock),
        unitCost: Number(unitCost),
        supplierId: supplierId || undefined,
        location,
      });
    } else {
      StorageService.addMaterial({
        code,
        name,
        unit,
        currentStock: Number(currentStock),
        minStock: Number(minStock),
        unitCost: Number(unitCost),
        supplierId: supplierId || undefined,
        location,
      });
    }

    setIsModalOpen(false);
    onRefresh();
  };

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLowStock = filterLowStock ? m.currentStock <= m.minStock : true;
    return matchesSearch && matchesLowStock;
  });

  const lowStockCount = materials.filter(m => m.currentStock <= m.minStock).length;

  return (
    <div className="space-y-5">
      {/* Module Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-slate-700" />
            Cadastro de Matérias-Primas & Insumos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Controle de inventário de insumos, custos unitários e estoque mínimo de segurança.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Matéria-Prima
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código ou descrição do insumo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              filterLowStock
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            Estoque Crítico ({lowStockCount})
          </button>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4 w-28">Código</th>
                <th className="py-3 px-4">Descrição do Insumo</th>
                <th className="py-3 px-4 w-20 text-center">Unidade</th>
                <th className="py-3 px-4 text-right w-32">Estoque Atual</th>
                <th className="py-3 px-4 text-right w-28">Estoque Mín.</th>
                <th className="py-3 px-4 text-right w-28">Custo Unit.</th>
                <th className="py-3 px-4 w-44">Fornecedor</th>
                <th className="py-3 px-4 text-right w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map((mat) => {
                  const isLow = mat.currentStock <= mat.minStock;
                  const supplier = suppliers.find(s => s.id === mat.supplierId);

                  return (
                    <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{mat.code}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{mat.name}</div>
                        {mat.location && (
                          <div className="text-[11px] text-slate-400">Local: {mat.location}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-600">{mat.unit}</td>
                      <td className="py-3 px-4 text-right">
                        <div className={`font-mono font-bold ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                          {mat.currentStock.toLocaleString('pt-BR')} {mat.unit}
                        </div>
                        {isLow && (
                          <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-tight flex items-center justify-end gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> Recomprar
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        {mat.minStock.toLocaleString('pt-BR')} {mat.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-800 font-medium">
                        R$ {mat.unitCost.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate max-w-[180px]">
                        {supplier ? supplier.name : <span className="text-slate-400 italic">Não vinculado</span>}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(mat)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="Editar Matéria-Prima"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(mat.id, mat.name)}
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
                    Nenhuma matéria-prima encontrada com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingMaterial ? 'Editar Matéria-Prima' : 'Cadastrar Nova Matéria-Prima'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unidade *</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as UnitOfMeasure)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  >
                    <option value="KG">Quilograma (KG)</option>
                    <option value="UN">Unidade (UN)</option>
                    <option value="G">Grama (G)</option>
                    <option value="M">Metro Linear (M)</option>
                    <option value="M2">Metro Quadrado (M²)</option>
                    <option value="L">Litro (L)</option>
                    <option value="ML">Mililitro (ML)</option>
                    <option value="CX">Caixa (CX)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome / Descrição do Insumo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aço Carbono SAE 1020 Barra 2 pol"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estoque Atual *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={currentStock}
                    onChange={(e) => setCurrentStock(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estoque Mínimo *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={minStock}
                    onChange={(e) => setMinStock(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Custo Unit. (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={unitCost}
                    onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fornecedor Principal</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  >
                    <option value="">Selecione um fornecedor...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Localização no Estoque</label>
                  <input
                    type="text"
                    placeholder="Ex: Prateleira B3"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
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
                  {editingMaterial ? 'Salvar Matéria-Prima' : 'Cadastrar Matéria-Prima'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
