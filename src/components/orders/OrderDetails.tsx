import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Phone, 
  User,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  Printer
} from 'lucide-react';
import { Order } from '../../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner@2.0.3';

interface OrderDetailsProps {
  order: Order;
  onBack: () => void;
}

export function OrderDetails({ order, onBack }: OrderDetailsProps) {
  const { updateOrder } = useApp();
  const [currentStatus, setCurrentStatus] = useState(order.status);

  const handleStatusChange = (newStatus: string) => {
    updateOrder(order.id, { status: newStatus as any });
    setCurrentStatus(newStatus as any);
    toast.success(`Order status updated to ${newStatus}`);
  };

  const handlePrint = () => {
    toast.info('Print feature in development');
  };

  const statusTimeline = [
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'in-kitchen', label: 'In Kitchen', icon: Package },
    { key: 'ready', label: 'Ready', icon: CheckCircle },
    { key: 'served', label: 'Served', icon: CheckCircle },
    { key: 'completed', label: 'Completed', icon: CheckCircle },
  ];

  const getStatusIndex = (status: string) => {
    return statusTimeline.findIndex(s => s.key === status);
  };

  const currentIndex = getStatusIndex(currentStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1>Order {order.orderNumber}</h1>
            <p className="text-gray-500 mt-1">
              Created {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {statusTimeline.map((status, index) => {
                  const Icon = status.icon;
                  const isActive = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  
                  return (
                    <div key={status.key} className="flex items-center gap-4 mb-6 last:mb-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${isCurrent ? 'text-blue-600' : ''}`}>
                          {status.label}
                        </div>
                        {isCurrent && (
                          <div className="text-sm text-gray-500">Current status</div>
                        )}
                      </div>
                      {isCurrent && currentStatus !== 'completed' && (
                        <Button 
                          size="sm"
                          onClick={() => {
                            const nextStatus = statusTimeline[index + 1]?.key;
                            if (nextStatus) handleStatusChange(nextStatus);
                          }}
                        >
                          Mark as {statusTimeline[index + 1]?.label}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Update Status</label>
                  <Select value={currentStatus} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-kitchen">In Kitchen</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="served">Served</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      {item.variation && (
                        <div className="text-sm text-gray-500">Variation: {item.variation}</div>
                      )}
                      <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{(item.price * item.quantity).toLocaleString()} FCFA</div>
                      <div className="text-sm text-gray-500">{item.price.toLocaleString()} each</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{(order.total / 1.1).toFixed(0)} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span>{(order.total * 0.1 / 1.1).toFixed(0)} FCFA</span>
                </div>
                <div className="flex justify-between font-medium text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-blue-600">{order.total.toLocaleString()} FCFA</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-600">Name</div>
                  <div className="font-medium">{order.customerName}</div>
                </div>
              </div>

              {order.customerPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Phone</div>
                    <div className="font-medium">{order.customerPhone}</div>
                  </div>
                </div>
              )}

              {order.tableNumber && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Table</div>
                    <div className="font-medium">Table {order.tableNumber}</div>
                  </div>
                </div>
              )}

              {order.deliveryAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-600">Delivery Address</div>
                    <div className="font-medium">{order.deliveryAddress}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Order Type</div>
                <Badge className="mt-1">
                  {order.type === 'dine-in' ? '🍽️' : order.type === 'takeaway' ? '🥡' : '🛵'} 
                  {' '}{order.type}
                </Badge>
              </div>

              <div>
                <div className="text-sm text-gray-600">Status</div>
                <Badge variant="outline" className="mt-1">
                  {currentStatus}
                </Badge>
              </div>

              <div>
                <div className="text-sm text-gray-600">Created</div>
                <div className="text-sm mt-1">
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {currentStatus !== 'completed' && currentStatus !== 'cancelled' && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentStatus === 'pending' && (
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleStatusChange('in-kitchen')}
                  >
                    Send to Kitchen
                  </Button>
                )}
                {currentStatus === 'ready' && (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleStatusChange('served')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Served
                  </Button>
                )}
                {currentStatus === 'served' && (
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleStatusChange('completed')}
                  >
                    Complete Order
                  </Button>
                )}
                <Button 
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700"
                  onClick={() => handleStatusChange('cancelled')}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Order
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
