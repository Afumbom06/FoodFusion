import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner@2.0.3';
import { InventoryItem, MenuItem } from '../../types';

interface InventoryItemFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: Partial<InventoryItem>) => void;
  item?: InventoryItem | null;
  branchId: string;
  menuItems: MenuItem[];
  suppliers: Array<{ id: string; name: string }>;
}

export function InventoryItemForm({
  open,
  onClose,
  onSave,
  item,
  branchId,
  menuItems,
  suppliers,
}: InventoryItemFormProps) {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    category: '',
    quantity: 0,
    unit: 'kg',
    reorderLevel: 0,
    costPerUnit: 0,
    branchId: branchId !== 'all' ? branchId : '',
    supplier: '',
    supplierId: '',
    expiryDate: '',
    linkedMenuItems: [],
  });

  const [selectedMenuItems, setSelectedMenuItems] = useState<string[]>([]);

  useEffect(() => {
    if (item) {
      setFormData(item);
      setSelectedMenuItems(item.linkedMenuItems || []);
    } else {
      setFormData({
        name: '',
        category: '',
        quantity: 0,
        unit: 'kg',
        reorderLevel: 0,
        costPerUnit: 0,
        branchId: branchId !== 'all' ? branchId : '',
        supplier: '',
        supplierId: '',
        expiryDate: '',
        linkedMenuItems: [],
      });
      setSelectedMenuItems([]);
    }
  }, [item, branchId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name?.trim()) {
      toast.error('Item name is required');
      return;
    }

    if (!formData.category?.trim()) {
      toast.error('Category is required');
      return;
    }

    if (formData.quantity === undefined || formData.quantity < 0) {
      toast.error('Quantity must be 0 or greater');
      return;
    }

    if (!formData.unit?.trim()) {
      toast.error('Unit is required');
      return;
    }

    if (formData.reorderLevel === undefined || formData.reorderLevel < 0) {
      toast.error('Reorder level must be 0 or greater');
      return;
    }

    if (formData.costPerUnit === undefined || formData.costPerUnit < 0) {
      toast.error('Cost per unit must be 0 or greater');
      return;
    }

    if (!formData.branchId) {
      toast.error('Please select a branch');
      return;
    }

    onSave({
      ...formData,
      linkedMenuItems: selectedMenuItems,
    });
    onClose();
  };

  const handleChange = (field: keyof InventoryItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const categories = [
    'Food Ingredients',
    'Beverages',
    'Spices & Seasonings',
    'Dairy Products',
    'Vegetables',
    'Meat & Poultry',
    'Seafood',
    'Cleaning Supplies',
    'Packaging Materials',
    'Other',
  ];

  const units = ['kg', 'g', 'liters', 'ml', 'pieces', 'packs', 'bottles', 'cans', 'boxes'];

  const toggleMenuItem = (menuItemId: string) => {
    setSelectedMenuItems(prev => {
      if (prev.includes(menuItemId)) {
        return prev.filter(id => id !== menuItemId);
      } else {
        return [...prev, menuItemId];
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
          <DialogDescription>
            {item ? 'Update the inventory item details below.' : 'Fill in the details to add a new inventory item.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Rice, Tomatoes, Cooking Oil"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          {/* Category and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select value={formData.unit} onValueChange={(value) => handleChange('unit', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quantity and Reorder Level */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Current Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorderLevel">Reorder Level *</Label>
              <Input
                id="reorderLevel"
                type="number"
                min="0"
                step="0.01"
                placeholder="Minimum stock level"
                value={formData.reorderLevel}
                onChange={(e) => handleChange('reorderLevel', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          {/* Cost Per Unit */}
          <div className="space-y-2">
            <Label htmlFor="costPerUnit">Cost Per Unit (FCFA) *</Label>
            <Input
              id="costPerUnit"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={formData.costPerUnit}
              onChange={(e) => handleChange('costPerUnit', parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          {/* Supplier */}
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Select
              value={formData.supplierId || 'none'}
              onValueChange={(value) => {
                if (value === 'none') {
                  handleChange('supplierId', '');
                  handleChange('supplier', '');
                } else {
                  const supplier = suppliers.find(s => s.id === value);
                  handleChange('supplierId', value);
                  handleChange('supplier', supplier?.name || '');
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Supplier</SelectItem>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate || ''}
              onChange={(e) => handleChange('expiryDate', e.target.value)}
            />
          </div>

          {/* Linked Menu Items */}
          <div className="space-y-2">
            <Label>Linked Menu Items (Optional)</Label>
            <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
              {menuItems.length === 0 ? (
                <p className="text-sm text-gray-500">No menu items available</p>
              ) : (
                menuItems.map(menuItem => (
                  <label
                    key={menuItem.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMenuItems.includes(menuItem.id)}
                      onChange={() => toggleMenuItem(menuItem.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{menuItem.name}</span>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-gray-500">
              Link this ingredient to menu items for automatic stock deduction
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {item ? 'Update Item' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
