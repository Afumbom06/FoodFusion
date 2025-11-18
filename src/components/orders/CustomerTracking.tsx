import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { ArrowLeft, Search, Clock, CheckCircle, Package, UtensilsCrossed } from 'lucide-react';
import { Order } from '../../types';

interface CustomerTrackingProps {
  onBack: () => void;
}

export function CustomerTracking({ onBack }: CustomerTrackingProps) {
  const { orders } = useApp();
  const [orderNumber, setOrderNumber] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  const handleSearch = () => {
    const order = orders.find(o => 
      o.orderNumber.toLowerCase() === orderNumber.toLowerCase()
    );
    if (order) {
      setTrackedOrder(order);
    } else {
      setTrackedOrder(null);
    }
  };

  const statusSteps = [
    { key: 'pending', label: 'Order Received', icon: Package },
    { key: 'in-kitchen', label: 'Preparing', icon: UtensilsCrossed },
    { key: 'ready', label: 'Ready', icon: CheckCircle },
    { key: 'served', label: 'Served', icon: CheckCircle },
  ];

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(s => s.key === status);
  };

  const getEstimatedTime = (order: Order) => {
    const createdTime = new Date(order.createdAt).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - createdTime) / 60000);
    
    if (order.status === 'served' || order.status === 'completed') {
      return 'Completed';
    }
    
    const estimatedTotal = 30; // 30 minutes estimated
    const remaining = Math.max(0, estimatedTotal - elapsed);
    return remaining > 0 ? `${remaining} mins` : 'Soon';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1>Track Your Order</h1>
          <p className="text-gray-500 mt-1">Enter your order number to track status</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="max-w-md mx-auto space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderNumber">Order Number</Label>
              <div className="flex gap-2">
                <Input
                  id="orderNumber"
                  placeholder="e.g., ORD-1234"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Track
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {trackedOrder ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order {trackedOrder.orderNumber}</CardTitle>
              <Badge className="bg-blue-600">
                {trackedOrder.type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Estimated Time */}
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <Clock className="w-12 h-12 mx-auto mb-3 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {getEstimatedTime(trackedOrder)}
              </div>
              <div className="text-sm text-gray-600">Estimated time remaining</div>
            </div>

            {/* Status Timeline */}
            <div className="space-y-4">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const currentIndex = getStatusIndex(trackedOrder.status);
                const isComplete = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <div key={step.key} className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isComplete ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${isCurrent ? 'text-blue-600' : ''}`}>
                        {step.label}
                      </div>
                      {isCurrent && (
                        <div className="text-sm text-gray-500">In progress...</div>
                      )}
                      {isComplete && !isCurrent && (
                        <div className="text-sm text-green-600">✓ Completed</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Items */}
            <div className="border-t pt-6">
              <h3 className="font-medium mb-3">Order Items</h3>
              <div className="space-y-2">
                {trackedOrder.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{(item.price * item.quantity).toLocaleString()} FCFA</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-medium text-lg border-t mt-3 pt-3">
                <span>Total</span>
                <span className="text-blue-600">{trackedOrder.total.toLocaleString()} FCFA</span>
              </div>
            </div>

            {/* Customer Info */}
            {trackedOrder.tableNumber && (
              <div className="border-t pt-6">
                <div className="text-sm text-gray-600">Table Number</div>
                <div className="font-medium">Table {trackedOrder.tableNumber}</div>
              </div>
            )}

            {/* Contact */}
            <div className="border-t pt-6 text-center">
              <div className="text-sm text-gray-600 mb-2">Need help?</div>
              <Button variant="outline">Call Restaurant</Button>
            </div>
          </CardContent>
        </Card>
      ) : orderNumber && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Order not found. Please check your order number.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
