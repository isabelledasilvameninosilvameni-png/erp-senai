import React from 'react';
import { CompanySettings } from '../types/erp';
import {
  Factory,
  TrendingUp,
  ShoppingBag,
  Layers,
  Package,
  Users,
  Gauge,
  BarChart3,
  Settings,
  ShieldCheck,
  Truck,
} from 'lucide-react';

export type ActiveTab =
  | 'ops'
  | 'pedidos'
  | 'produtos'
  | 'materiais'
  | 'clientes'
  | 'fornecedores'
  | 'capacidade'
  | 'relatorios';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: CompanySettings;
  onOpenSettings: () => void;
  activeOpsCount: number;
  lowStockCount: number;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  settings,
  onOpenSettings,
  activeOpsCount,
  lowStockCount,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: any; badge?: number; alertBadge?: boolean }[] = [
    { id: 'ops', label: 'Ordens de Produção', icon: TrendingUp, badge: activeOpsCount },
    { id: 'pedidos', label: 'Pedidos de Venda', icon: ShoppingBag },
    { id: 'produtos', label: 'Produtos & Ficha Técnica', icon: Layers },
    { id: 'materiais', label: 'Matérias-Primas', icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined, alertBadge: true },
    { id: 'capacidade', label: 'Capacidade Produtiva', icon: Gauge },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'fornecedores', label: 'Fornecedores', icon: Truck },
    { id: 'relatorios', label: 'Relatórios & Documentos', icon: BarChart3 },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 print:hidden">
      {/* Top Brand & Responsible Engineer Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-xs">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">MINI ERP INDUSTRIAL</span>
              <span className="text-[11px] text-amber-400 font-medium">· PCP & Produção</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">{settings.companyName}</p>
          </div>
        </div>

        {/* Responsible Technical Manager Banner (Prominent in header as requested) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-md transition-colors text-left group"
            title="Clique para editar responsável técnico ou configurações"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <span>Responsável Técnico:</span>
              </div>
              <div className="text-xs font-semibold text-white leading-tight">
                {settings.responsibleName}
                <span className="font-mono text-[10px] text-slate-400 ml-1.5 font-normal">
                  ({settings.responsibleCouncil})
                </span>
              </div>
            </div>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            title="Configurações & Backup"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto">
        <nav className="flex space-x-1 py-1.5" aria-label="Navegação Principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-white text-slate-950 font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? item.alertBadge
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-900 text-white'
                        : item.alertBadge
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
