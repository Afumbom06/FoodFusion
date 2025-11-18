import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Search, Printer, Calendar } from 'lucide-react';
import { Order } from '../../types';

interface ReprintModalProps {
  open: boolean;
  onClose: () => void;
  orders: Order[];
  onReprintOrder: (order: Order) => void;
}

export function ReprintModal({ open, onClose, orders, onReprintOrder }: ReprintModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Get recent completed orders (last 50)
  const recentOrders = useMemo(() => {
    return orders
      .filter(o => o.status === 'completed')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);
  }, [orders]);

  // Filter orders based on search
  const filteredOrders = useMemo(() => {
    if (!searchQuery) return recentOrders;

    const query = searchQuery.toLowerCase();
    return recentOrders.filter(order =>
      order.orderNumber.toLowerCase().includes(query) ||
      order.customerName?.toLowerCase().includes(query) ||
      order.tableNumber?.toLowerCase().includes(query)
    );
  }, [recentOrders, searchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleReprint = (order: Order) => {
    onReprintOrder(order);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Reprint Receipt
          </DialogTitle>
          <DialogDescription>
            Search and select an order to reprint its receipt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by order number, customer, or table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Orders List */}
          <ScrollArea className="h-96">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Printer className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No orders found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{order.orderNumber}</span>
                          <Badge variant="outline" className="text-xs">
                            {order.type}
                          </Badge>
                        </div>
                        {order.customerName && (
                          <div className="text-sm text-gray-600">
                            Customer: {order.customerName}
                          </div>
                        )}
                        {order.tableNumber && (
                          <div className="text-sm text-gray-600">
                            Table: {order.tableNumber}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleReprint(order)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Reprint
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(order.createdAt)}
                      </div>
                      <div>{formatTime(order.createdAt)}</div>
                    </div>

                    {/* Items Summary */}
                    <div className="text-sm text-gray-600 mb-2">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}:
                      <span className="ml-2 text-gray-500">
                        {order.items.slice(0, 3).map(item => item.name).join(', ')}
                        {order.items.length > 3 && ` +${order.items.length - 3} more`}
                      </span>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between border-t pt-2">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="text-blue-600">
                        {order.total.toLocaleString()} FCFA
                      </span>
                    </div>

                    {order.paymentMethod && (
                      <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                        <span>Payment:</span>
                        <span className="uppercase">{order.paymentMethod}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Summary */}
          <div className="bg-gray-50 border rounded-lg p-3 text-sm text-gray-600">
            Showing {filteredOrders.length} of {recentOrders.length} recent orders
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
