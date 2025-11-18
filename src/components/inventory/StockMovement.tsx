import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { ArrowDownCircle, ArrowUpCircle, Calendar, User, Package } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { InventoryItem, StockMovement as StockMovementType, Supplier } from '../../types';

interface StockMovementProps {
  inventory: InventoryItem[];
  movements: StockMovementType[];
  suppliers: Supplier[];
  selectedBranch: string;
  userName: string;
  onAddMovement: (movement: Partial<StockMovementType>) => void;
}

export function StockMovement({
  inventory,
  movements,
  suppliers,
  selectedBranch,
  userName,
  onAddMovement,
}: StockMovementProps) {
  const [activeTab, setActiveTab] = useState<'in' | 'out'>('in');
  
  // Stock In Form
  const [stockInData, setStockInData] = useState({
    itemId: '',
    quantity: 0,
    unitCost: 0,
    supplierId: '',
    notes: '',
  });

  // Stock Out Form
  const [stockOutData, setStockOutData] = useState({
    itemId: '',
    quantity: 0,
    reason: '',
    notes: '',
  });

  // Filter inventory by branch
  const availableItems = useMemo(() => {
    if (selectedBranch === 'all') return inventory;
    return inventory.filter(item => item.branchId === selectedBranch);
  }, [inventory, selectedBranch]);

  // Filter movements by branch
  const filteredMovements = useMemo(() => {
    if (selectedBranch === 'all') return movements;
    const branchItemIds = availableItems.map(item => item.id);
    return movements.filter(movement => branchItemIds.includes(movement.itemId));
  }, [movements, availableItems, selectedBranch]);

  // Sort movements by date (newest first)
  const sortedMovements = useMemo(() => {
    return [...filteredMovements].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredMovements]);

  // Handle Stock In
  const handleStockIn = (e: React.FormEvent) => {
    e.preventDefault();

    if (!stockInData.itemId) {
      toast.error('Please select an item');
      return;
    }

    if (stockInData.quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (stockInData.unitCost < 0) {
      toast.error('Unit cost cannot be negative');
      return;
    }

    const item = inventory.find(i => i.id === stockInData.itemId);
    if (!item) return;

    const movement: Partial<StockMovementType> = {
      itemId: stockInData.itemId,
      itemName: item.name,
      type: 'in',
      quantity: stockInData.quantity,
      date: new Date().toISOString(),
      userName: userName,
      notes: stockInData.notes,
      supplierId: stockInData.supplierId || undefined,
      unitCost: stockInData.unitCost || undefined,
    };

    onAddMovement(movement);
    toast.success(`Stock added: ${stockInData.quantity} ${item.unit} of ${item.name}`);
    
    // Reset form
    setStockInData({
      itemId: '',
      quantity: 0,
      unitCost: 0,
      supplierId: '',
      notes: '',
    });
  };

  // Handle Stock Out
  const handleStockOut = (e: React.FormEvent) => {
    e.preventDefault();

    if (!stockOutData.itemId) {
      toast.error('Please select an item');
      return;
    }

    if (stockOutData.quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (!stockOutData.reason) {
      toast.error('Please select a reason');
      return;
    }

    const item = inventory.find(i => i.id === stockOutData.itemId);
    if (!item) return;

    if (stockOutData.quantity > item.quantity) {
      toast.error(`Insufficient stock. Available: ${item.quantity} ${item.unit}`);
      return;
    }

    const movement: Partial<StockMovementType> = {
      itemId: stockOutData.itemId,
      itemName: item.name,
      type: 'out',
      quantity: stockOutData.quantity,
      reason: stockOutData.reason,
      date: new Date().toISOString(),
      userName: userName,
      notes: stockOutData.notes,
    };

    onAddMovement(movement);
    toast.success(`Stock removed: ${stockOutData.quantity} ${item.unit} of ${item.name}`);
    
    // Reset form
    setStockOutData({
      itemId: '',
      quantity: 0,
      reason: '',
      notes: '',
    });
  };

  const reasons = [
    'Used in Kitchen',
    'Damaged',
    'Expired',
    'Spoiled',
    'Lost',
    'Transfer to Another Branch',
    'Other',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl">Stock Movement</h2>
        <p className="text-gray-500 mt-1">Record additions and deductions in stock</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forms Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Record Movement</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="in" className="gap-2">
                    <ArrowDownCircle className="w-4 h-4" />
                    Stock In
                  </TabsTrigger>
                  <TabsTrigger value="out" className="gap-2">
                    <ArrowUpCircle className="w-4 h-4" />
                    Stock Out
                  </TabsTrigger>
                </TabsList>

                {/* Stock In Form */}
                <TabsContent value="in" className="space-y-4 mt-4">
                  <form onSubmit={handleStockIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Item *</Label>
                      <Select
                        value={stockInData.itemId}
                        onValueChange={(value) =>
                          setStockInData({ ...stockInData, itemId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose item" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableItems.map(item => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} ({item.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter quantity"
                        value={stockInData.quantity || ''}
                        onChange={(e) =>
                          setStockInData({
                            ...stockInData,
                            quantity: parseFloat(e.target.value) || 0,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Unit Cost (FCFA)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Cost per unit"
                        value={stockInData.unitCost || ''}
                        onChange={(e) =>
                          setStockInData({
                            ...stockInData,
                            unitCost: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Supplier</Label>
                      <Select
                        value={stockInData.supplierId}
                        onValueChange={(value) =>
                          setStockInData({ ...stockInData, supplierId: value })
                        }
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

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        placeholder="Additional notes..."
                        value={stockInData.notes}
                        onChange={(e) =>
                          setStockInData({ ...stockInData, notes: e.target.value })
                        }
                        rows={3}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <ArrowDownCircle className="w-4 h-4 mr-2" />
                      Add Stock
                    </Button>
                  </form>
                </TabsContent>

                {/* Stock Out Form */}
                <TabsContent value="out" className="space-y-4 mt-4">
                  <form onSubmit={handleStockOut} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Item *</Label>
                      <Select
                        value={stockOutData.itemId}
                        onValueChange={(value) =>
                          setStockOutData({ ...stockOutData, itemId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose item" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableItems.map(item => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} (Available: {item.quantity} {item.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter quantity"
                        value={stockOutData.quantity || ''}
                        onChange={(e) =>
                          setStockOutData({
                            ...stockOutData,
                            quantity: parseFloat(e.target.value) || 0,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Reason *</Label>
                      <Select
                        value={stockOutData.reason}
                        onValueChange={(value) =>
                          setStockOutData({ ...stockOutData, reason: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {reasons.map(reason => (
                            <SelectItem key={reason} value={reason}>
                              {reason}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        placeholder="Additional notes..."
                        value={stockOutData.notes}
                        onChange={(e) =>
                          setStockOutData({ ...stockOutData, notes: e.target.value })
                        }
                        rows={3}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      <ArrowUpCircle className="w-4 h-4 mr-2" />
                      Remove Stock
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Movement History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Stock Movement History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedMovements.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No stock movements recorded</p>
                  </div>
                ) : (
                  sortedMovements.map(movement => (
                    <div
                      key={movement.id}
                      className={`border rounded-lg p-4 ${
                        movement.type === 'in'
                          ? 'border-green-200 bg-green-50/50'
                          : 'border-red-200 bg-red-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{movement.itemName}</span>
                            <Badge
                              className={
                                movement.type === 'in'
                                  ? 'bg-green-100 text-green-700 border-green-300'
                                  : 'bg-red-100 text-red-700 border-red-300'
                              }
                            >
                              {movement.type === 'in' ? (
                                <>
                                  <ArrowDownCircle className="w-3 h-3 mr-1" />
                                  Stock In
                                </>
                              ) : (
                                <>
                                  <ArrowUpCircle className="w-3 h-3 mr-1" />
                                  Stock Out
                                </>
                              )}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            Quantity: {movement.quantity} units
                          </div>
                        </div>
                        <div
                          className={`text-2xl ${
                            movement.type === 'in' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {movement.type === 'in' ? '+' : '-'}
                          {movement.quantity}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(movement.date).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          {movement.userName}
                        </div>
                      </div>

                      {movement.reason && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-600">Reason:</span>{' '}
                          <span className="text-gray-700">{movement.reason}</span>
                        </div>
                      )}

                      {movement.unitCost && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-600">Unit Cost:</span>{' '}
                          <span className="text-gray-700">
                            {movement.unitCost.toLocaleString()} FCFA
                          </span>
                        </div>
                      )}

                      {movement.notes && (
                        <div className="mt-2 text-sm text-gray-600 italic">
                          Note: {movement.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
