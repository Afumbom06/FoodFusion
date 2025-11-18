import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Order } from '../../types';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';

interface KitchenDisplayProps {
  onBack: () => void;
}

export function KitchenDisplay({ onBack }: KitchenDisplayProps) {
  const { orders, updateOrder, selectedBranch } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Filter kitchen orders
  const kitchenOrders = useMemo(() => {
    return orders
      .filter(o => 
        ['pending', 'in-kitchen', 'ready'].includes(o.status) &&
        (selectedBranch === 'all' || o.branchId === selectedBranch)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [orders, selectedBranch]);

  const stats = useMemo(() => ({
    pending: kitchenOrders.filter(o => o.status === 'pending').length,
    cooking: kitchenOrders.filter(o => o.status === 'in-kitchen').length,
    ready: kitchenOrders.filter(o => o.status === 'ready').length,
  }), [kitchenOrders]);

  const getWaitTime = (order: Order) => {
    const minutes = Math.floor((currentTime.getTime() - new Date(order.createdAt).getTime()) / 60000);
    return minutes;
  };

  const handleStatusChange = (orderId: string, status: string) => {
    updateOrder(orderId, { status: status as any });
    toast.success('Order status updated');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in-kitchen': return 'bg-blue-500';
      case 'ready': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1>Kitchen Display System</h1>
            <p className="text-gray-500 mt-1">Manage orders in real-time</p>
          </div>
        </div>
        <div className="text-2xl font-mono">
          {currentTime.toLocaleTimeString()}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600 mt-1">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.cooking}</div>
              <div className="text-sm text-gray-600 mt-1">Cooking</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.ready}</div>
              <div className="text-sm text-gray-600 mt-1">Ready</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kitchen Orders */}
      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kitchenOrders.map(order => {
            const waitTime = getWaitTime(order);
            const isUrgent = waitTime > 15;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className={`${isUrgent ? 'ring-2 ring-red-500' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                        <div className="text-sm text-gray-500 mt-1">
                          {order.type === 'dine-in' ? `Table ${order.tableNumber}` : order.type}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <div className={`text-sm flex items-center gap-1 ${
                          isUrgent ? 'text-red-600 font-bold' : 'text-gray-600'
                        }`}>
                          {isUrgent && <AlertCircle className="w-4 h-4" />}
                          <Clock className="w-4 h-4" />
                          {waitTime}m
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Items */}
                    <div className="space-y-2">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                          <span className="font-medium">{item.quantity}x {item.name}</span>
                          {item.variation && (
                            <span className="text-gray-500 text-xs">{item.variation}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {order.status === 'pending' && (
                        <Button
                          onClick={() => handleStatusChange(order.id, 'in-kitchen')}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          Start Cooking
                        </Button>
                      )}
                      {order.status === 'in-kitchen' && (
                        <Button
                          onClick={() => handleStatusChange(order.id, 'ready')}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Ready
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <div className="flex-1 text-center p-2 bg-green-100 text-green-800 rounded-lg font-medium">
                          ✓ Ready for Pickup
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>

      {kitchenOrders.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <div className="text-lg">All caught up!</div>
            <div className="text-sm mt-1">No orders in the kitchen queue</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
