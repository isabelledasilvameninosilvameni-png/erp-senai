import React from 'react';
import { ProductionOrder, CompanySettings, Product } from '../../types/erp';
import { Printer, X, CheckCircle, ShieldCheck, Clock, Layers, Calendar, Factory } from 'lucide-react';

interface Props {
  op: ProductionOrder;
  product?: Product;
  companySettings: CompanySettings;
  onClose: () => void;
}

export const PrintableProductionOrder: React.FC<Props> = ({
  op,
  product,
  companySettings,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const hoursPlanned = (op.totalPlannedMinutes / 60).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden print:shadow-none print:border-none print:max-w-none print:w-full">
        {/* Action bar (hidden on print) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Factory className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-sm">Visualização de Documento Oficial de Chão de Fábrica</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Imprimir Ordem (A4)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet */}
        <div className="p-8 print:p-4 text-slate-800 text-sm font-sans bg-white" id="printable-op-sheet">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-slate-950 tracking-tight uppercase">
                {companySettings.companyName}
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                {companySettings.tradeName} · CNPJ: {companySettings.cnpj} · IE: {companySettings.stateRegistration}
              </p>
              <p className="text-xs text-slate-500">
                {companySettings.address} · {companySettings.cityState} · Tel: {companySettings.phone}
              </p>
            </div>

            <div className="text-right border-l-2 border-slate-200 pl-6">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Documento Técnico</span>
              <div className="text-2xl font-black font-mono tracking-tight text-slate-950">{op.code}</div>
              <div className="text-[11px] font-mono text-slate-500">Emissão: {op.createdAt}</div>
              <div className="inline-block mt-1 px-2 py-0.5 bg-slate-100 border border-slate-300 text-slate-800 text-[10px] font-bold uppercase rounded-sm">
                Prioridade: {op.priority.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Title Banner */}
          <div className="bg-slate-100 border border-slate-300 px-4 py-2 mb-5 flex items-center justify-between">
            <span className="font-bold text-slate-900 uppercase tracking-wide text-xs">
              ORDEM DE PRODUÇÃO E ROTEIRO DE FABRICAÇÃO (PCP)
            </span>
            <span className="text-xs text-slate-600 font-mono">
              Status Atual: <strong className="uppercase">{op.status.replace('_', ' ')}</strong>
            </span>
          </div>

          {/* Grid: Order & Product info */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            {/* Left box: Product specifications */}
            <div className="border border-slate-300 rounded p-3 bg-slate-50/50">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-700" />
                Dados do Produto a Fabricar
              </div>
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500 w-28 font-medium">Código:</td>
                    <td className="py-1 font-mono font-bold text-slate-900">{op.productCode}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500 font-medium">Produto:</td>
                    <td className="py-1 font-semibold text-slate-900">{op.productName}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500 font-medium">Qtd. Planejada:</td>
                    <td className="py-1 font-bold text-slate-950 font-mono text-sm">
                      {op.targetQuantity} {product?.unit || 'UN'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-500 font-medium">Tempo Unitário:</td>
                    <td className="py-1 text-slate-800 font-mono">
                      {op.unitCycleMinutes} min / unidade (Total: {hoursPlanned}h)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right box: Planning & Destination */}
            <div className="border border-slate-300 rounded p-3 bg-slate-50/50">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-700" />
                Planejamento & Destino
              </div>
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500 w-28 font-medium">Pedido Venda:</td>
                    <td className="py-1 font-mono text-slate-900">
                      {op.salesOrderNumber || 'Produção Para Estoque (Avulsa)'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500 font-medium">Cliente:</td>
                    <td className="py-1 font-medium text-slate-900">{op.customerName || 'Estoque Interno'}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1 text-slate-500 font-medium">Posto / Linha:</td>
                    <td className="py-1 text-slate-900 font-medium">{op.workCenterName || 'Geral'}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-500 font-medium">Período Previsto:</td>
                    <td className="py-1 font-mono text-slate-800">
                      {op.startDate} até {op.expectedEndDate}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bill of Materials (BOM) Pick list */}
          <div className="mb-5 border border-slate-300 rounded overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 text-xs font-bold text-slate-800 uppercase flex items-center justify-between">
              <span>Lista de Separação de Matéria-Prima (BOM)</span>
              <span className="text-[10px] text-slate-500 font-normal">Conferência no Almoxarifado</span>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-1.5 px-3 text-left w-24">Código</th>
                  <th className="py-1.5 px-3 text-left">Insumo / Matéria-Prima</th>
                  <th className="py-1.5 px-3 text-right w-24">Qtd Requerida</th>
                  <th className="py-1.5 px-3 text-center w-16">Unidade</th>
                  <th className="py-1.5 px-3 text-center w-28">Status Estoque</th>
                  <th className="py-1.5 px-3 text-center w-24">Visto Almox.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {op.bomSnapshot && op.bomSnapshot.length > 0 ? (
                  op.bomSnapshot.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-1.5 px-3 font-mono font-medium text-slate-700">{item.rawMaterialCode}</td>
                      <td className="py-1.5 px-3 text-slate-900">{item.rawMaterialName}</td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-950">
                        {item.requiredQuantity}
                      </td>
                      <td className="py-1.5 px-3 text-center text-slate-600">{item.unit}</td>
                      <td className="py-1.5 px-3 text-center">
                        <span className="text-[11px] text-emerald-700 font-medium">Disponível</span>
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        <div className="w-16 h-5 border border-slate-400 mx-auto rounded-xs"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-3 text-center text-slate-500 italic">
                      Nenhum insumo associado na ficha técnica.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Manufacturing Operations Routing */}
          <div className="mb-5 border border-slate-300 rounded overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 text-xs font-bold text-slate-800 uppercase flex items-center justify-between">
              <span>Roteiro de Operações & Apontamento no Chão de Fábrica</span>
              <span className="text-[10px] text-slate-500 font-normal">Preenchimento obrigatório pelo operador</span>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="py-1.5 px-2 text-center w-10">Etapa</th>
                  <th className="py-1.5 px-3 text-left">Operação</th>
                  <th className="py-1.5 px-3 text-left w-36">Posto de Trabalho</th>
                  <th className="py-1.5 px-2 text-center w-24">Data / Início</th>
                  <th className="py-1.5 px-2 text-center w-24">Data / Término</th>
                  <th className="py-1.5 px-2 text-center w-20">Qtd Produzida</th>
                  <th className="py-1.5 px-3 text-center w-24">Rubrica Operador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { step: '01', op: 'Separação e Inspeção de Matéria-Prima', center: 'Almoxarifado' },
                  { step: '02', op: 'Preparação / Setup de Máquinas e Ferramentas', center: op.workCenterName || 'Produção' },
                  { step: '03', op: 'Fabricação / Usinagem / Conformação', center: op.workCenterName || 'Produção' },
                  { step: '04', op: 'Tratamento Superficial / Acabamento / Pintura', center: 'Acabamento' },
                  { step: '05', op: 'Inspeção Dimensional e Controle de Qualidade', center: 'CQ - Qualidade' },
                  { step: '06', op: 'Embalagem e Identificação Final', center: 'Expedição' },
                ].map((row, idx) => (
                  <tr key={idx} className="h-9">
                    <td className="px-2 text-center font-mono font-bold text-slate-600">{row.step}</td>
                    <td className="px-3 text-slate-800 font-medium">{row.op}</td>
                    <td className="px-3 text-slate-600">{row.center}</td>
                    <td className="px-2 text-center text-slate-400 font-mono text-[10px]">___/___ __:__</td>
                    <td className="px-2 text-center text-slate-400 font-mono text-[10px]">___/___ __:__</td>
                    <td className="px-2 text-center text-slate-400 font-mono text-[10px]">______ un</td>
                    <td className="px-3 text-center">
                      <div className="w-16 h-5 border border-dashed border-slate-400 mx-auto"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {op.notes && (
            <div className="mb-5 p-2.5 border border-amber-200 bg-amber-50/60 rounded text-xs">
              <span className="font-bold text-amber-900 uppercase text-[10px] block mb-0.5">Observações Técnicas:</span>
              <p className="text-slate-700">{op.notes}</p>
            </div>
          )}

          {/* Official Signatures & Technical Manager Stamp */}
          <div className="border border-slate-300 rounded p-4 bg-slate-50/30">
            <div className="grid grid-cols-2 gap-8 items-end">
              {/* Operator signature */}
              <div className="text-center">
                <div className="border-b border-slate-400 pb-1 mb-1">
                  <span className="text-xs text-transparent select-none">Assinatura</span>
                </div>
                <div className="text-xs font-medium text-slate-700">Operador / Líder de Linha</div>
                <div className="text-[10px] text-slate-400">Data: ____/____/2026</div>
              </div>

              {/* Technical Manager Official Block */}
              <div className="border-2 border-slate-800 p-3 rounded bg-white relative">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
                  <span>Aprovação Técnica & Liberação</span>
                  <ShieldCheck className="w-4 h-4 text-slate-800" />
                </div>
                <div className="text-xs font-bold text-slate-950 uppercase">
                  {op.responsibleTechnician || companySettings.responsibleName}
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  {companySettings.responsibleRole}
                </div>
                <div className="text-[11px] font-mono text-slate-600">
                  {op.responsibleCouncil || companySettings.responsibleCouncil}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between text-[10px] text-slate-500">
                  <span>Visto Técnico: ___________________</span>
                  <span>Data: ___/___/2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
            <span>Sistema Mini ERP Industrial · Gestão & Planejamento da Produção</span>
            <span>Via oficial de produção · Página 1 de 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
