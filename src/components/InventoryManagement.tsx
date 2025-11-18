import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Package, AlertTriangle, Users, TrendingUp, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { InventoryItem, Supplier, StockMovement } from '../types';
import { InventoryDashboard } from './inventory/InventoryDashboard';
import { InventoryItemForm } from './inventory/InventoryItemForm';
import { LowStockAlerts } from './inventory/LowStockAlerts';
import { SupplierManagement } from './inventory/SupplierManagement';
import { StockMovement as StockMovementComponent } from './inventory/StockMovement';

export function InventoryManagement() {
  const {
    inventory,
    selectedBranch,
    menuItems,
    suppliers,
    stockMovements,
    addInventoryItem,
    updateInventory,
    deleteInventoryItem,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addStockMovement,
  } = useApp();
  
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showItemForm, setShowItemForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [restockItemId, setRestockItemId] = useState<string | null>(null);

  // Handle Add/Edit Item
  const handleSaveItem = (itemData: Partial<InventoryItem>) => {
    if (selectedItem) {
      // Update existing item
      updateInventory(selectedItem.id, itemData);
      toast.success('Inventory item updated successfully');
    } else {
      // Add new item
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        name: itemData.name!,
        category: itemData.category!,
        quantity: itemData.quantity || 0,
        unit: itemData.unit!,
        minStock: itemData.reorderLevel || 0,
        reorderLevel: itemData.reorderLevel || 0,
        costPerUnit: itemData.costPerUnit || 0,
        branchId: itemData.branchId!,
        supplier: itemData.supplier,
        supplierId: itemData.supplierId,
        expiryDate: itemData.expiryDate,
        linkedMenuItems: itemData.linkedMenuItems,
        lastRestocked: new Date().toISOString(),
      };
      addInventoryItem(newItem);
      toast.success('Inventory item added successfully');
    }
    setShowItemForm(false);
    setSelectedItem(null);
  };

  // Handle Delete Item
  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      deleteInventoryItem(id);
      toast.success('Inventory item deleted');
    }
  };

  // Handle Edit Item
  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowItemForm(true);
  };

  // Handle View Item
  const handleViewItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowItemForm(true);
  };

  // Handle Add Item
  const handleAddItem = () => {
    setSelectedItem(null);
    setShowItemForm(true);
  };

  // Handle Restock from Low Stock Alerts
  const handleRestock = (itemId: string) => {
    setRestockItemId(itemId);
    setActiveTab('stock-movement');
  };

  // Handle Add Supplier
  const handleAddSupplier = (supplierData: Partial<Supplier>) => {
    const newSupplier: Supplier = {
      id: Date.now().toString(),
      name: supplierData.name!,
      email: supplierData.email!,
      phone: supplierData.phone!,
      contactPerson: supplierData.contactPerson,
      address: supplierData.address,
      itemsSupplied: [],
      rating: supplierData.rating || 5,
      paymentTerms: supplierData.paymentTerms,
    };
    addSupplier(newSupplier);
  };

  // Handle Update Supplier
  const handleUpdateSupplier = (id: string, supplierData: Partial<Supplier>) => {
    updateSupplier(id, supplierData);
  };

  // Handle Delete Supplier
  const handleDeleteSupplier = (id: string) => {
    deleteSupplier(id);
  };

  // Handle Add Stock Movement
  const handleAddStockMovement = (movementData: Partial<StockMovement>) => {
    const newMovement: StockMovement = {
      id: Date.now().toString(),
      itemId: movementData.itemId!,
      itemName: movementData.itemName!,
      type: movementData.type!,
      quantity: movementData.quantity!,
      date: movementData.date || new Date().toISOString(),
      userId: user?.id || '1',
      userName: movementData.userName || user?.name || 'Unknown',
      reason: movementData.reason,
      notes: movementData.notes,
      supplierId: movementData.supplierId,
      unitCost: movementData.unitCost,
      orderId: movementData.orderId,
    };
    addStockMovement(newMovement);
    setRestockItemId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Inventory & Stock Management</h1>
        <p className="text-gray-500 mt-1">
          Track and manage raw materials, ingredients, and stock levels
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
          <TabsTrigger value="dashboard" className="gap-2">
            <Package className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Low Stock Alerts
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2">
            <Users className="w-4 h-4" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="stock-movement" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Stock Movement
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-6">
          <InventoryDashboard
            inventory={inventory}
            selectedBranch={selectedBranch}
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onViewItem={handleViewItem}
          />
        </TabsContent>

        {/* Low Stock Alerts Tab */}
        <TabsContent value="alerts" className="mt-6">
          <LowStockAlerts
            inventory={inventory}
            suppliers={suppliers}
            selectedBranch={selectedBranch}
            onRestock={handleRestock}
          />
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="mt-6">
          <SupplierManagement
            suppliers={suppliers}
            onAddSupplier={handleAddSupplier}
            onUpdateSupplier={handleUpdateSupplier}
            onDeleteSupplier={handleDeleteSupplier}
          />
        </TabsContent>

        {/* Stock Movement Tab */}
        <TabsContent value="stock-movement" className="mt-6">
          <StockMovementComponent
            inventory={inventory}
            movements={stockMovements}
            suppliers={suppliers}
            selectedBranch={selectedBranch}
            userName={user?.name || 'Unknown'}
            onAddMovement={handleAddStockMovement}
          />
        </TabsContent>
      </Tabs>

      {/* Item Form Modal */}
      <InventoryItemForm
        open={showItemForm}
        onClose={() => {
          setShowItemForm(false);
          setSelectedItem(null);
        }}
        onSave={handleSaveItem}
        item={selectedItem}
        branchId={selectedBranch}
        menuItems={menuItems}
        suppliers={suppliers.map(s => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
