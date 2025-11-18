import React, { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Clock, 
  MapPin, 
  Phone, 
  Package, 
  CheckCircle, 
  ChevronRight,
  Plus,
  Search,
  Filter,
  History,
  UtensilsCrossed,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Merge
} from 'lucide-react';
import { Order } from '../../types';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface OrderListProps {
  onViewDetails: (order: Order) => void;
  onNewOrder: () => void;
  onViewKitchen: () => void;
  onViewHistory: () => void;
  onMergeSplit: (orders: Order[]) => void;
  onViewTracking: () => void;
}

export function OrderList({ 
  onViewDetails, 
  onNewOrder, 
  onViewKitchen, 
  onViewHistory,
  onMergeSplit,
  onViewTracking 
}: OrderListProps) {
  const { orders, updateOrder, selectedBranch } = useApp();
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // Format time ago
  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by branch
    if (selectedBranch !== 'all') {
      filtered = filtered.filter(o => o.branchId === selectedBranch);
    }

    // Filter by status type (active vs completed)
    if (selectedStatus === 'active') {
      filtered = filtered.filter(o => 
        ['pending', 'in-kitchen', 'ready', 'served'].includes(o.status)
      );
    } else if (selectedStatus === 'completed') {
      filtered = filtered.filter(o => o.status === 'completed');
    } else if (selectedStatus !== 'all') {
      filtered = filtered.filter(o => o.status === selectedStatus);
    }

    // Filter by order type
    if (selectedType !== 'all') {
      filtered = filtered.filter(o => o.type === selectedType);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(o =>
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.tableNumber?.toString().includes(searchQuery)
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders, selectedBranch, selectedStatus, selectedType, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeOrders = orders.filter(o => 
      ['pending', 'in-kitchen', 'ready', 'served'].includes(o.status)
    );
    const todayRevenue = orders
      .filter(o => o.status === 'completed' || o.status === 'served')
      .reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending');

    return {
      active: activeOrders.length,
      revenue: todayRevenue,
      pending: pendingOrders.length,
      completed: orders.filter(o => o.status === 'completed').length,
    };
  }, [orders]);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrder(orderId, { status: newStatus as any });
    toast.success(`Order status updated to ${newStatus}`);
  };

  const handleQuickServe = (order: Order) => {
    handleStatusChange(order.id, 'served');
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleMergeSelected = () => {
    if (selectedOrders.length < 2) {
      toast.error('Select at least 2 orders to merge');
      return;
    }
    const ordersToMerge = orders.filter(o => selectedOrders.includes(o.id));
    onMergeSplit(ordersToMerge);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in-kitchen': return 'bg-blue-500';
      case 'ready': return 'bg-purple-500';
      case 'served': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-kitchen': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'served': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'dine-in': return '🍽️';
      case 'takeaway': return '🥡';
      case 'delivery': return '🛵';
      default: return '📋';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1>Order Management</h1>
          <p className="text-gray-500 mt-1">Track and manage all restaurant orders</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={onViewTracking}
          >
            Track Order
          </Button>
          <Button 
            variant="outline"
            onClick={onViewKitchen}
          >
            <UtensilsCrossed className="w-4 h-4 mr-2" />
            Kitchen
          </Button>
          <Button 
            variant="outline"
            onClick={onViewHistory}
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
          <Button 
            onClick={onNewOrder}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <div className="text-2xl mt-1">{stats.active}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <div className="text-2xl mt-1 text-yellow-600">{stats.pending}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Revenue</p>
                <div className="text-2xl mt-1">
                  {(stats.revenue / 1000).toFixed(0)}K
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <div className="text-2xl mt-1">{stats.completed}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order #, customer, table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="md:col-span-3">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="dine-in">🍽️ Dine-in</SelectItem>
                  <SelectItem value="takeaway">🥡 Takeaway</SelectItem>
                  <SelectItem value="delivery">🛵 Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3">
              <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
                <TabsList className="w-full">
                  <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
                  <TabsTrigger value="pending" className="flex-1">Pending</TabsTrigger>
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {selectedOrders.length > 0 && (
              <div className="md:col-span-2">
                <Button 
                  onClick={handleMergeSelected}
                  variant="outline"
                  className="w-full"
                >
                  <Merge className="w-4 h-4 mr-2" />
                  Merge ({selectedOrders.length})
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <div className="text-lg">No orders found</div>
            <div className="text-sm mt-1">Orders will appear here when customers place them</div>
            <Button onClick={onNewOrder} className="mt-4 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create First Order
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {filteredOrders.map(order => (
            <motion.div key={order.id} variants={item}>
              <Card 
                className={`hover:shadow-lg transition-all duration-300 ${
                  selectedOrders.includes(order.id) ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <span>{getOrderTypeIcon(order.type)}</span>
                          <span>{order.orderNumber}</span>
                        </CardTitle>
                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(order.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusBadgeColor(order.status)}>
                        {order.status.replace('-', ' ')}
                      </Badge>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status)} animate-pulse`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{order.customerName}</div>
                    {order.customerPhone && (
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {order.customerPhone}
                      </div>
                    )}
                    {order.tableNumber && (
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Table: {order.tableNumber}
                      </div>
                    )}
                  </div>

                  {/* Order Items Summary */}
                  <div className="border-t pt-3">
                    <div className="text-xs text-gray-600 mb-2">
                      {order.items.length} item(s)
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="flex-1 truncate">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-medium text-blue-600">
                        {order.total.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => onViewDetails(order)}
                    >
                      Details
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                    {order.status === 'ready' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleQuickServe(order)}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Serve
                      </Button>
                    )}
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleStatusChange(order.id, 'in-kitchen')}
                      >
                        Send to Kitchen
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
