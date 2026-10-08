import React, { useState } from 'react';
import { Supplier } from '../../types/erp';
import { StorageService } from '../../services/storage';
import { Plus, Search, Edit2, Trash2, Truck, Phone, Mail, User } from 'lucide-react';

interface Props {
  suppliers: Supplier[];
  onRefresh: () => void;
}

export const SuppliersModule: React.FC<Props> = ({ suppliers, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [suppliedMaterialsDescription, setSuppliedMaterialsDescription] = useState('');

  const openCreateModal = () => {
    setEditingSupplier(null);
    setName('');
    setDocument('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setSuppliedMaterialsDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (sup: Supplier) => {
    setEditingSupplier(sup);
    setName(sup.name);
    setDocument(sup.document);
    setContactPerson(sup.contactPerson);
    setPhone(sup.phone);
    setEmail(sup.email);
    setSuppliedMaterialsDescription(sup.suppliedMaterialsDescription || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, supName: string) => {
    if (confirm(`Deseja excluir o fornecedor "${supName}"?`)) {
      StorageService.deleteSupplier(id);
      onRefresh();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSupplier) {
      StorageService.updateSupplier({
        ...editingSupplier,
        name,
        document,
        contactPerson,
        phone,
        email,
        suppliedMaterialsDescription,
      });
    } else {
      StorageService.addSupplier({
        name,
        document,
        contactPerson,
        phone,
        email,
        suppliedMaterialsDescription,
      });
    }

    setIsModalOpen(false);
    onRefresh();
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.document.includes(searchTerm) ||
    (s.suppliedMaterialsDescription && s.suppliedMaterialsDescription.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-slate-700" />
            Cadastro de Fornecedores
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de parceiros de suprimentos e insumos industriais.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Fornecedor
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar fornecedor por razão social, CNPJ ou tipo de insumo fornecido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Razão Social do Fornecedor</th>
                <th className="py-3 px-4 w-40">CNPJ</th>
                <th className="py-3 px-4 w-44">Pessoa de Contato</th>
                <th className="py-3 px-4 w-48">Contato</th>
                <th className="py-3 px-4">Insumos Fornecidos</th>
                <th className="py-3 px-4 text-right w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map(sup => (
                  <tr key={sup.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{sup.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{sup.document}</td>
                    <td className="py-3 px-4 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sup.contactPerson}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-slate-700">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{sup.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{sup.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {sup.suppliedMaterialsDescription || <span className="text-slate-400 italic">Não informado</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(sup)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(sup.id, sup.name)}
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
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Nenhum fornecedor encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingSupplier ? 'Editar Fornecedor' : 'Cadastrar Novo Fornecedor'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Razão Social / Nome da Empresa *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CNPJ *</label>
                  <input
                    type="text"
                    required
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pessoa de Contato / Vendedor</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone Comercial *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 0000-0000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail Comercial *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vendas@fornecedor.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição dos Insumos / Materiais Fornecidos</label>
                <textarea
                  rows={2}
                  value={suppliedMaterialsDescription}
                  onChange={(e) => setSuppliedMaterialsDescription(e.target.value)}
                  placeholder="Ex: Chapas de aço, perfis laminados, fixadores..."
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
                  {editingSupplier ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
