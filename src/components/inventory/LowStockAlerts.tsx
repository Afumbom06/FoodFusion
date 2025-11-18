import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AlertTriangle, XCircle, Mail, Phone, Package } from 'lucide-react';
import { InventoryItem, Supplier } from '../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner@2.0.3';

interface LowStockAlertsProps {
  inventory: InventoryItem[];
  suppliers: Supplier[];
  selectedBranch: string;
  onRestock: (itemId: string) => void;
}

export function LowStockAlerts({
  inventory,
  suppliers,
  selectedBranch,
  onRestock,
}: LowStockAlertsProps) {
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Filter items based on stock status
  const { lowStockItems, outOfStockItems } = useMemo(() => {
    let items = inventory;

    if (selectedBranch !== 'all') {
      items = items.filter(item => item.branchId === selectedBranch);
    }

    const lowStock = items.filter(item => item.quantity > 0 && item.quantity <= item.reorderLevel);
    const outOfStock = items.filter(item => item.quantity === 0);

    return { lowStockItems: lowStock, outOfStockItems: outOfStock };
  }, [inventory, selectedBranch]);

  const handleNotifySupplier = (item: InventoryItem) => {
    const supplier = suppliers.find(s => s.id === item.supplierId);
    if (!supplier) {
      toast.error('No supplier found for this item');
      return;
    }

    setSelectedSupplier(supplier);
    setNotificationMessage(
      `Dear ${supplier.name},\n\nWe would like to place an order for:\n\n` +
      `Item: ${item.name}\n` +
      `Current Stock: ${item.quantity} ${item.unit}\n` +
      `Reorder Level: ${item.reorderLevel} ${item.unit}\n\n` +
      `Please send us a quote and estimated delivery time.\n\n` +
      `Best regards`
    );
    setShowNotifyModal(true);
  };

  const handleSendNotification = () => {
    // In a real app, this would send an email/SMS
    toast.success(`Notification sent to ${selectedSupplier?.name}`);
    setShowNotifyModal(false);
    setSelectedSupplier(null);
    setNotificationMessage('');
  };

  const getStockPercentage = (item: InventoryItem) => {
    if (item.quantity === 0) return 0;
    return (item.quantity / item.reorderLevel) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl">Low Stock & Alerts</h2>
        <p className="text-gray-500 mt-1">Items that need immediate attention</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <div className="text-3xl text-amber-600 mt-1">{lowStockItems.length}</div>
                <p className="text-xs text-gray-500 mt-1">Needs restocking soon</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <div className="text-3xl text-red-600 mt-1">{outOfStockItems.length}</div>
                <p className="text-xs text-gray-500 mt-1">Requires immediate action</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Out of Stock Items */}
      {outOfStockItems.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-700 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Out of Stock Items - Urgent
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {outOfStockItems.map(item => (
                <div
                  key={item.id}
                  className="border border-red-200 rounded-lg p-4 bg-red-50/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4>{item.name}</h4>
                        <Badge className="bg-red-100 text-red-700 border-red-300">
                          OUT OF STOCK
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Category: {item.category}
                      </div>
                      {item.supplier && (
                        <div className="text-sm text-gray-600">
                          Supplier: {item.supplier}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">Current:</span>
                      <div className="text-red-600">0 {item.unit}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Min Required:</span>
                      <div>{item.reorderLevel} {item.unit}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Cost/Unit:</span>
                      <div>{item.costPerUnit.toLocaleString()} FCFA</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Est. Cost:</span>
                      <div className="text-blue-600">
                        {(item.reorderLevel * item.costPerUnit).toLocaleString()} FCFA
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      size="sm"
                      onClick={() => onRestock(item.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Record Restock
                    </Button>
                    {item.supplierId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleNotifySupplier(item)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Notify Supplier
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Items */}
      {lowStockItems.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="bg-amber-50">
            <CardTitle className="text-amber-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Low Stock Items - Warning
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {lowStockItems.map(item => {
                const stockPercentage = getStockPercentage(item);
                return (
                  <div
                    key={item.id}
                    className="border border-amber-200 rounded-lg p-4 bg-amber-50/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4>{item.name}</h4>
                          <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                            LOW STOCK
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Category: {item.category}
                        </div>
                        {item.supplier && (
                          <div className="text-sm text-gray-600">
                            Supplier: {item.supplier}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                      <div>
                        <span className="text-gray-500">Current:</span>
                        <div className="text-amber-600">{item.quantity} {item.unit}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Min Required:</span>
                        <div>{item.reorderLevel} {item.unit}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Stock Level:</span>
                        <div className="text-amber-600">{stockPercentage.toFixed(0)}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Needed:</span>
                        <div className="text-blue-600">
                          ~{Math.max(0, item.reorderLevel - item.quantity).toFixed(1)} {item.unit}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        size="sm"
                        onClick={() => onRestock(item.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Record Restock
                      </Button>
                      {item.supplierId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleNotifySupplier(item)}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Notify Supplier
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Alerts */}
      {lowStockItems.length === 0 && outOfStockItems.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg text-gray-900 mb-2">All Stock Levels Good!</h3>
              <p className="text-gray-500">
                No items require immediate attention at this time.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notify Supplier Modal */}
      <Dialog open={showNotifyModal} onOpenChange={setShowNotifyModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Notify Supplier</DialogTitle>
            <DialogDescription>
              Send a notification to the supplier about restocking needs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedSupplier && (
              <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <strong>Supplier:</strong> {selectedSupplier.name}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {selectedSupplier.email}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {selectedSupplier.phone}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm">Message:</label>
              <Textarea
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowNotifyModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendNotification} className="bg-blue-600 hover:bg-blue-700">
              <Mail className="w-4 h-4 mr-2" />
              Send Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
