import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
  ChefHat,
  Package,
  Bell,
  QrCode,
  Settings,
} from 'lucide-react';
import { Order, InventoryItem, Reservation } from '../../types';
import { useNavigate } from 'react-router-dom';

interface MobileDashboardProps {
  orders: Order[];
  inventory: InventoryItem[];
  reservations: Reservation[];
  revenue: number;
  onQuickAction?: (action: string) => void;
}

export function MobileDashboard({
  orders,
  inventory,
  reservations,
  revenue,
  onQuickAction,
}: MobileDashboardProps) {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.createdAt.startsWith(today));
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
    const lowStockItems = inventory.filter(i => i.currentStock <= i.minStock && i.currentStock > 0);
    const upcomingReservations = reservations.filter(r => 
      r.status === 'confirmed' && r.date >= today
    ).length;

    return {
      todayOrders: todayOrders.length,
      todayRevenue: todayOrders.reduce((sum, o) => sum + o.total, 0),
      pendingOrders: pendingOrders.length,
      lowStock: lowStockItems.length,
      upcomingReservations,
    };
  }, [orders, inventory, reservations]);

  const quickActions = [
    { id: 'new-order', icon: ShoppingCart, label: 'New Order', color: 'bg-blue-500', route: '/pos' },
    { id: 'kitchen', icon: ChefHat, label: 'Kitchen', color: 'bg-orange-500', route: '/orders' },
    { id: 'inventory', icon: Package, label: 'Inventory', color: 'bg-green-500', route: '/inventory' },
    { id: 'qr-menu', icon: QrCode, label: 'QR Menu', color: 'bg-purple-500', route: '/tables' },
  ];

  const alerts = useMemo(() => {
    const result = [];
    if (stats.pendingOrders > 5) {
      result.push({ type: 'warning', message: `${stats.pendingOrders} orders pending` });
    }
    if (stats.lowStock > 0) {
      result.push({ type: 'error', message: `${stats.lowStock} items low on stock` });
    }
    return result;
  }, [stats]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl">Manager Dashboard</h1>
            <p className="text-sm opacity-90 mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => navigate('/settings')}
          >
            <Settings className="w-6 h-6" />
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs opacity-90">Today's Revenue</span>
            </div>
            <div className="text-xl font-bold">{stats.todayRevenue.toLocaleString()} FCFA</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-xs opacity-90">Orders Today</span>
            </div>
            <div className="text-xl font-bold">{stats.todayOrders}</div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="px-4 pt-4 space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                alert.type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'
              }`}
            >
              <AlertTriangle className={`w-5 h-5 ${alert.type === 'error' ? 'text-red-600' : 'text-amber-600'}`} />
              <span className={`text-sm ${alert.type === 'error' ? 'text-red-700' : 'text-amber-700'}`}>
                {alert.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-4">
        <h2 className="font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={() => navigate(action.route)}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mb-3`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Status Cards */}
      <div className="px-4 space-y-3">
        <h2 className="font-semibold">Current Status</h2>

        {/* Pending Orders */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/orders')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium">Pending Orders</div>
                  <div className="text-sm text-gray-600">Require attention</div>
                </div>
              </div>
              <Badge className="bg-orange-500 text-white">{stats.pendingOrders}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Reservations */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/tables')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">Upcoming Reservations</div>
                  <div className="text-sm text-gray-600">Next 24 hours</div>
                </div>
              </div>
              <Badge className="bg-blue-500 text-white">{stats.upcomingReservations}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock */}
        {stats.lowStock > 0 && (
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/inventory')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium">Low Stock Items</div>
                    <div className="text-sm text-gray-600">Need reordering</div>
                  </div>
                </div>
                <Badge className="bg-red-500 text-white">{stats.lowStock}</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <div className="p-4">
        <h2 className="font-semibold mb-3">Recent Orders</h2>
        <div className="space-y-2">
          {orders.slice(0, 5).map(order => (
            <Card key={order.id} className="cursor-pointer hover:shadow-sm" onClick={() => navigate(`/orders/${order.id}`)}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Order #{order.orderNumber}</div>
                    <div className="text-sm text-gray-600">{order.type.replace('-', ' ')}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">{order.total.toLocaleString()} FCFA</div>
                    <Badge
                      className={`text-xs ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
