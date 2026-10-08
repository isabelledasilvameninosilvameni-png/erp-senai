import React, { useState } from 'react';
import { Product, RawMaterial, BOMItem, UnitOfMeasure } from '../../types/erp';
import { StorageService } from '../../services/storage';
import { Plus, Search, Edit2, Trash2, Clock, Layers, DollarSign, X, Check, Eye } from 'lucide-react';

interface Props {
  products: Product[];
  materials: RawMaterial[];
  onRefresh: () => void;
}

export const ProductsModule: React.FC<Props> = ({ products, materials, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingBOMProduct, setViewingBOMProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState<UnitOfMeasure>('UN');
  const [cycleTimeMinutes, setCycleTimeMinutes] = useState<number>(30);
  const [sellingPrice, setSellingPrice] = useState<number>(100);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(5);
  const [description, setDescription] = useState('');
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);

  // Temp item for adding to BOM
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [materialQty, setMaterialQty] = useState<number>(1);

  const openCreateModal = () => {
    setEditingProduct(null);
    const nextCode = `PA-${String(products.length + 101)}`;
    setCode(nextCode);
    setName('');
    setCategory('Manufaturados');
    setUnit('UN');
    setCycleTimeMinutes(30);
    setSellingPrice(150);
    setCurrentStock(0);
    setMinStock(5);
    setDescription('');
    setBomItems([]);
    setSelectedMaterialId(materials[0]?.id || '');
    setMaterialQty(1);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setCode(prod.code);
    setName(prod.name);
    setCategory(prod.category);
    setUnit(prod.unit);
    setCycleTimeMinutes(prod.cycleTimeMinutes);
    setSellingPrice(prod.sellingPrice);
    setCurrentStock(prod.currentStock);
    setMinStock(prod.minStock);
    setDescription(prod.description || '');
    setBomItems([...prod.bom]);
    setSelectedMaterialId(materials[0]?.id || '');
    setMaterialQty(1);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, prodName: string) => {
    if (confirm(`Deseja remover o produto "${prodName}"?`)) {
      StorageService.deleteProduct(id);
      onRefresh();
    }
  };

  const handleAddBOMItem = () => {
    if (!selectedMaterialId || materialQty <= 0) return;
    const existingIndex = bomItems.findIndex(b => b.rawMaterialId === selectedMaterialId);
    if (existingIndex >= 0) {
      const updated = [...bomItems];
      updated[existingIndex].quantityPerUnit += materialQty;
      setBomItems(updated);
    } else {
      setBomItems([...bomItems, { rawMaterialId: selectedMaterialId, quantityPerUnit: materialQty }]);
    }
    setMaterialQty(1);
  };

  const handleRemoveBOMItem = (matId: string) => {
    setBomItems(bomItems.filter(b => b.rawMaterialId !== matId));
  };

  // Calculate standard material cost based on current BOM
  const calculatedBOMCost = bomItems.reduce((acc, item) => {
    const mat = materials.find(m => m.id === item.rawMaterialId);
    if (!mat) return acc;
    return acc + (mat.unitCost * item.quantityPerUnit);
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      code,
      name,
      category,
      unit,
      cycleTimeMinutes: Number(cycleTimeMinutes),
      standardCost: Number(calculatedBOMCost.toFixed(2)),
      sellingPrice: Number(sellingPrice),
      currentStock: Number(currentStock),
      minStock: Number(minStock),
      bom: bomItems,
      description,
    };

    if (editingProduct) {
      StorageService.updateProduct({
        ...editingProduct,
        ...payload,
      });
    } else {
      StorageService.addProduct(payload);
    }

    setIsModalOpen(false);
    onRefresh();
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-slate-700" />
            Produtos & Fichas Técnicas (BOM)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastro de produtos acabados, tempos padrão de processo e composição de matérias-primas.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Produto / Ficha Técnica
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código, produto ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4 w-28">Código</th>
                <th className="py-3 px-4">Produto & Descrição</th>
                <th className="py-3 px-4 w-32">Categoria</th>
                <th className="py-3 px-4 w-28 text-center">Tempo Proc.</th>
                <th className="py-3 px-4 w-32 text-center">Ficha Técnica</th>
                <th className="py-3 px-4 text-right w-28">Estoque Acab.</th>
                <th className="py-3 px-4 text-right w-28">Custo MP</th>
                <th className="py-3 px-4 text-right w-28">Preço Venda</th>
                <th className="py-3 px-4 text-right w-28">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{prod.code}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{prod.name}</div>
                      {prod.description && (
                        <div className="text-[11px] text-slate-500 line-clamp-1">{prod.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{prod.category}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {prod.cycleTimeMinutes} min
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setViewingBOMProduct(prod)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors"
                      >
                        <Layers className="w-3 h-3 text-slate-600" />
                        {prod.bom.length} insumo{prod.bom.length !== 1 ? 's' : ''}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {prod.currentStock} {prod.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      R$ {prod.standardCost.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                      R$ {prod.sellingPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id, prod.name)}
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
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Nenhum produto cadastrado encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar / Editar Produto e Ficha Técnica */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                {editingProduct ? 'Editar Ficha Técnica do Produto' : 'Cadastrar Novo Produto & Ficha Técnica'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Basic product info */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Código do Produto *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome / Descrição Comercial *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mancal Industrial Ø25mm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex: Peças Usinadas"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unidade</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as UnitOfMeasure)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  >
                    <option value="UN">Unidade (UN)</option>
                    <option value="KG">Quilo (KG)</option>
                    <option value="M">Metro (M)</option>
                    <option value="CX">Caixa (CX)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tempo de Processo (min) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      value={cycleTimeMinutes}
                      onChange={(e) => setCycleTimeMinutes(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                      min/un
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Preço Venda Sugerido (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estoque Atual Acabado</label>
                  <input
                    type="number"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Bill of Materials (BOM) Section */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Layers className="w-4 h-4 text-slate-600" />
                    <span>Estrutura do Produto (Ficha Técnica / Insumos Necessários)</span>
                  </div>
                  <div className="text-xs font-mono text-slate-600">
                    Custo de Matéria-Prima: <strong className="text-slate-900">R$ {calculatedBOMCost.toFixed(2)}</strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Informe a quantidade consumida de cada insumo para produzir 1 (uma) unidade deste produto.
                </p>

                {/* Add BOM Item Row */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-wrap gap-2 items-end mb-3">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Insumo / Matéria-Prima</label>
                    <select
                      value={selectedMaterialId}
                      onChange={(e) => setSelectedMaterialId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="">Selecione o insumo...</option>
                      {materials.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.code} - {m.name} ({m.unit} | R$ {m.unitCost.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-28">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Qtd p/ 1 Unid.</label>
                    <input
                      type="number"
                      step="any"
                      min="0.001"
                      value={materialQty}
                      onChange={(e) => setMaterialQty(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddBOMItem}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded transition-colors"
                  >
                    + Adicionar Insumo
                  </button>
                </div>

                {/* BOM Items Table */}
                <div className="border border-slate-200 rounded-md overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Código</th>
                        <th className="py-2 px-3">Insumo</th>
                        <th className="py-2 px-3 text-right">Qtd Unitária</th>
                        <th className="py-2 px-3 text-right">Custo Parcial</th>
                        <th className="py-2 px-3 text-center w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bomItems.length > 0 ? (
                        bomItems.map(item => {
                          const mat = materials.find(m => m.id === item.rawMaterialId);
                          if (!mat) return null;
                          const partialCost = mat.unitCost * item.quantityPerUnit;
                          return (
                            <tr key={item.rawMaterialId} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-mono text-slate-600">{mat.code}</td>
                              <td className="py-2 px-3 font-medium text-slate-900">{mat.name}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                                {item.quantityPerUnit} {mat.unit}
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-slate-600">
                                R$ {partialCost.toFixed(2)}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBOMItem(item.rawMaterialId)}
                                  className="text-slate-400 hover:text-rose-600 p-0.5 rounded"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-400 text-xs italic">
                            Nenhum insumo adicionado ainda. Adicione os materiais necessários acima.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notas de Fabricação / Processo</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Instruções de usinagem, tolerâncias, acabamentos ou cuidados especiais..."
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
                  {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualização Rápida da Ficha Técnica */}
      {viewingBOMProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Ficha Técnica Oficial (BOM)</h3>
                <p className="text-xs text-slate-300">{viewingBOMProduct.code} - {viewingBOMProduct.name}</p>
              </div>
              <button
                onClick={() => setViewingBOMProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Tempo Padrão:</span>
                  <span className="font-mono font-bold text-slate-800">{viewingBOMProduct.cycleTimeMinutes} min/un</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Custo Padrão Estimado:</span>
                  <span className="font-mono font-bold text-slate-800">R$ {viewingBOMProduct.standardCost.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">Composição de Insumos</h4>
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Código</th>
                        <th className="py-2 px-3">Insumo</th>
                        <th className="py-2 px-3 text-right">Qtd / Peça</th>
                        <th className="py-2 px-3 text-right">Estoque Atual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {viewingBOMProduct.bom.map(b => {
                        const mat = materials.find(m => m.id === b.rawMaterialId);
                        if (!mat) return null;
                        return (
                          <tr key={b.rawMaterialId}>
                            <td className="py-2 px-3 font-mono text-slate-600">{mat.code}</td>
                            <td className="py-2 px-3 font-medium text-slate-900">{mat.name}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                              {b.quantityPerUnit} {mat.unit}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-600">
                              {mat.currentStock} {mat.unit}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {viewingBOMProduct.description && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
                  <span className="font-semibold text-slate-700 block mb-0.5">Notas do Processo:</span>
                  <p className="text-slate-600">{viewingBOMProduct.description}</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewingBOMProduct(null)}
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
