import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import {
  CompanySettings,
  Product,
  RawMaterial,
  Customer,
  Supplier,
  WorkCenter,
  SalesOrder,
  ProductionOrder,
} from './types/erp';
import { Navbar, ActiveTab } from './components/Navbar';
import { ProductionOrdersModule } from './components/producao/ProductionOrdersModule';
import { SalesOrdersModule } from './components/producao/SalesOrdersModule';
import { ProductsModule } from './components/cadastros/ProductsModule';
import { RawMaterialsModule } from './components/cadastros/RawMaterialsModule';
import { CustomersModule } from './components/cadastros/CustomersModule';
import { SuppliersModule } from './components/cadastros/SuppliersModule';
import { CapacityModule } from './components/cadastros/CapacityModule';
import { ReportsModule } from './components/relatorios/ReportsModule';
import { SettingsModal } from './components/settings/SettingsModal';
import { PrintableProductionOrder } from './components/documentos/PrintableProductionOrder';
import { ShieldCheck, Factory, AlertTriangle, Layers, TrendingUp } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('ops');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [printingOP, setPrintingOP] = useState<ProductionOrder | null>(null);

  // Cross-module trigger: generate OP directly from Sales Order
  const [pendingOPCreation, setPendingOPCreation] = useState<{
    salesOrder: SalesOrder;
    productId: string;
    qty: number;
  } | null>(null);

  // Reactive state synced with persistent storage
  const [settings, setSettings] = useState<CompanySettings>(() => StorageService.getSettings());
  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());
  const [materials, setMaterials] = useState<RawMaterial[]>(() => StorageService.getMaterials());
  const [customers, setCustomers] = useState<Customer[]>(() => StorageService.getCustomers());
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => StorageService.getSuppliers());
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>(() => StorageService.getWorkCenters());
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => StorageService.getSalesOrders());
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(() => StorageService.getProductionOrders());

  const refreshAllData = () => {
    setSettings(StorageService.getSettings());
    setProducts(StorageService.getProducts());
    setMaterials(StorageService.getMaterials());
    setCustomers(StorageService.getCustomers());
    setSuppliers(StorageService.getSuppliers());
    setWorkCenters(StorageService.getWorkCenters());
    setSalesOrders(StorageService.getSalesOrders());
    setProductionOrders(StorageService.getProductionOrders());
  };

  const handleGenerateOPFromSalesOrder = (order: SalesOrder, productId: string, qty: number) => {
    setPendingOPCreation({ salesOrder: order, productId, qty });
    setActiveTab('ops');
  };

  const activeOpsCount = productionOrders.filter(
    (o) => o.status !== 'concluida' && o.status !== 'cancelada'
  ).length;

  const lowStockCount = materials.filter((m) => m.currentStock <= m.minStock).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Official Technical Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeOpsCount={activeOpsCount}
        lowStockCount={lowStockCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'ops' && (
          <ProductionOrdersModule
            productionOrders={productionOrders}
            products={products}
            materials={materials}
            workCenters={workCenters}
            salesOrders={salesOrders}
            companySettings={settings}
            onRefresh={refreshAllData}
            onOpenPrintSheet={(op) => setPrintingOP(op)}
            initialNewOPParams={pendingOPCreation}
            onClearInitialNewOPParams={() => setPendingOPCreation(null)}
          />
        )}

        {activeTab === 'pedidos' && (
          <SalesOrdersModule
            salesOrders={salesOrders}
            customers={customers}
            products={products}
            onRefresh={refreshAllData}
            onGenerateOP={handleGenerateOPFromSalesOrder}
          />
        )}

        {activeTab === 'produtos' && (
          <ProductsModule
            products={products}
            materials={materials}
            onRefresh={refreshAllData}
          />
        )}

        {activeTab === 'materiais' && (
          <RawMaterialsModule
            materials={materials}
            suppliers={suppliers}
            onRefresh={refreshAllData}
          />
        )}

        {activeTab === 'capacidade' && (
          <CapacityModule
            workCenters={workCenters}
            productionOrders={productionOrders}
            onRefresh={refreshAllData}
          />
        )}

        {activeTab === 'clientes' && (
          <CustomersModule
            customers={customers}
            onRefresh={refreshAllData}
          />
        )}

        {activeTab === 'fornecedores' && (
          <SuppliersModule
            suppliers={suppliers}
            onRefresh={refreshAllData}
          />
        )}

        {activeTab === 'relatorios' && (
          <ReportsModule
            productionOrders={productionOrders}
            products={products}
            materials={materials}
            customers={customers}
            companySettings={settings}
            onOpenPrintOP={(op) => setPrintingOP(op)}
          />
        )}
      </main>

      {/* App Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-xs text-slate-500 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">{settings.tradeName}</span>
            <span>·</span>
            <span>Sistema Integrado de PCP & Manufatura</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Responsável Técnico: <strong>{settings.responsibleName}</strong> ({settings.responsibleCouncil})</span>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={(updated) => setSettings(updated)}
          onClose={() => setIsSettingsOpen(false)}
          onDataReset={refreshAllData}
        />
      )}

      {/* Printable Sheet Modal (renders when user clicks "Imprimir Ficha" or "Imprimir Ordem") */}
      {printingOP && (
        <PrintableProductionOrder
          op={printingOP}
          product={products.find((p) => p.id === printingOP.productId)}
          companySettings={settings}
          onClose={() => setPrintingOP(null)}
        />
      )}
    </div>
  );
}
