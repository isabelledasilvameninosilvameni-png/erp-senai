import React, { useState } from 'react';
import { CompanySettings } from '../../types/erp';
import { StorageService } from '../../services/storage';
import { X, Save, Building, ShieldCheck, Download, Upload, RotateCcw, AlertTriangle, Check } from 'lucide-react';

interface Props {
  settings: CompanySettings;
  onSave: (updated: CompanySettings) => void;
  onClose: () => void;
  onDataReset: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  settings,
  onSave,
  onClose,
  onDataReset,
}) => {
  const [form, setForm] = useState<CompanySettings>({ ...settings });
  const [successMsg, setSuccessMsg] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(form);
    onSave(form);
    setSuccessMsg('Configurações salvas com sucesso!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  const handleExportBackup = () => {
    const json = StorageService.exportDatabase();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_mini_erp_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importDatabase(content);
      if (success) {
        setImportStatus('Backup restaurado com sucesso! Recarregando dados...');
        setTimeout(() => {
          onDataReset();
          onClose();
        }, 1500);
      } else {
        setImportStatus('Erro: Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (confirm('Tem certeza que deseja restaurar os dados de demonstração iniciais? Suas alterações serão substituídas.')) {
      StorageService.resetDatabaseToDefaults();
      onDataReset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold">Configurações & Responsável Técnico</h2>
              <p className="text-xs text-slate-300">Definições da empresa e dados que assinam ordens e relatórios</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg && (
          <div className="m-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </div>
        )}

        {importStatus && (
          <div className="m-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg">
            {importStatus}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section: Technical Responsible (High Priority as per user prompt) */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-lg">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-3">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Dados do Responsável Técnico (Exibido em todos os documentos)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo do Responsável Técnico *
                </label>
                <input
                  type="text"
                  required
                  value={form.responsibleName}
                  onChange={(e) => setForm({ ...form, responsibleName: e.target.value })}
                  placeholder="Ex: Eng. Carlos Eduardo Ribeiro"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cargo / Função *
                </label>
                <input
                  type="text"
                  required
                  value={form.responsibleRole}
                  onChange={(e) => setForm({ ...form, responsibleRole: e.target.value })}
                  placeholder="Ex: Gerente de Produção & PCP"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registro Profissional (CREA / CRQ / CFT) *
                </label>
                <input
                  type="text"
                  required
                  value={form.responsibleCouncil}
                  onChange={(e) => setForm({ ...form, responsibleCouncil: e.target.value })}
                  placeholder="Ex: CREA-SP 506.789/D"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Company Data */}
          <div>
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-3">
              <Building className="w-4 h-4 text-slate-600" />
              <span>Dados Cadastrais da Empresa</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Razão Social</label>
                <input
                  type="text"
                  required
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nome Fantasia</label>
                <input
                  type="text"
                  value={form.tradeName}
                  onChange={(e) => setForm({ ...form, tradeName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">CNPJ</label>
                <input
                  type="text"
                  value={form.cnpj}
                  onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Inscrição Estadual</label>
                <input
                  type="text"
                  value={form.stateRegistration}
                  onChange={(e) => setForm({ ...form, stateRegistration: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Telefone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Persistent Storage & Backup */}
          <div className="pt-4 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
              Persistência & Backup do Banco de Dados
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Todos os cadastros e ordens são armazenados de forma persistente. Você pode exportar uma cópia de segurança em JSON ou restaurá-la a qualquer momento.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-300 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar Backup (JSON)
              </button>

              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-300 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                Restaurar Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium rounded border border-rose-200 transition-colors ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurar Dados Padrão
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-md shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
