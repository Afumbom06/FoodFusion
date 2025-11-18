import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Order } from '../../types';
import { toast } from 'sonner@2.0.3';

interface MergeSplitBillsProps {
  orders: Order[];
  onBack: () => void;
}

export function MergeSplitBills({ orders, onBack }: MergeSplitBillsProps) {
  const [splits, setSplits] = useState<{ name: string; items: any[]; total: number }[]>([
    { name: 'Bill 1', items: [], total: 0 }
  ]);

  const allItems = orders.flatMap(order => 
    order.items.map(item => ({ ...item, orderId: order.id, orderNumber: order.orderNumber }))
  );

  const [unassignedItems, setUnassignedItems] = useState(allItems);

  const handleAddSplit = () => {
    setSplits([...splits, { name: `Bill ${splits.length + 1}`, items: [], total: 0 }]);
  };

  const handleAssignItem = (item: any, splitIndex: number) => {
    const newSplits = [...splits];
    newSplits[splitIndex].items.push(item);
    newSplits[splitIndex].total += item.price * item.quantity;
    setSplits(newSplits);
    setUnassignedItems(unassignedItems.filter(i => i.id !== item.id));
  };

  const handleRemoveItem = (item: any, splitIndex: number) => {
    const newSplits = [...splits];
    newSplits[splitIndex].items = newSplits[splitIndex].items.filter(i => i.id !== item.id);
    newSplits[splitIndex].total -= item.price * item.quantity;
    setSplits(newSplits);
    setUnassignedItems([...unassignedItems, item]);
  };

  const handleSave = () => {
    toast.success('Bills split successfully');
    onBack();
  };

  const totalAmount = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1>Merge / Split Bills</h1>
            <p className="text-gray-500 mt-1">
              Manage bills for {orders.length} order(s)
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddSplit}>
            <Plus className="w-4 h-4 mr-2" />
            Add Split
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save & Apply
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Original Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {orders.map(order => (
              <Badge key={order.id} variant="outline">
                {order.orderNumber}: {order.total.toLocaleString()} FCFA
              </Badge>
            ))}
          </div>
          <div className="mt-4 text-lg font-bold">
            Total: {totalAmount.toLocaleString()} FCFA
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unassigned Items */}
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unassignedItems.map(item => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        {item.orderNumber} • Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {splits.map((_, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleAssignItem(item, index)}
                      >
                        → Bill {index + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Split Bills */}
        {splits.map((split, splitIndex) => (
          <Card key={splitIndex}>
            <CardHeader>
              <CardTitle>{split.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {split.items.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 text-sm">
                    No items assigned
                  </div>
                ) : (
                  split.items.map(item => (
                    <div key={item.id} className="p-2 bg-gray-50 rounded flex justify-between items-center">
                      <div>
                        <div className="text-sm">{item.name}</div>
                        <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{(item.price * item.quantity).toLocaleString()}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveItem(item, splitIndex)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">{split.total.toLocaleString()} FCFA</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
