import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  UtensilsCrossed,
  TrendingUp,
  TrendingDown,
  Search,
  Clock,
  Eye,
  Award,
  Target,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'motion/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';

// Animated counter component
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

// KPI Card component
function KPICard({ 
  title, 
  value, 
  suffix = '', 
  icon: Icon, 
  trend, 
  trendValue,
  color = 'blue'
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4" style={{ borderLeftColor: `var(--${color}-600)` }}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{title}</p>
              <div className="text-3xl">
                <AnimatedCounter value={value} suffix={suffix} />
              </div>
              {trend !== undefined && (
                <div className="flex items-center gap-1 text-sm">
                  {trend > 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">+{trendValue}</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <span className="text-red-600">{trendValue}</span>
                    </>
                  )}
                  <span className="text-gray-500">vs yesterday</span>
                </div>
              )}
            </div>
            <div className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center`}>
              <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function Dashboard() {
  const { orders, tables, staff, customers, salesData, selectedBranch } = useApp();
  const { user } = useAuth();
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Filter data by selected branch
  const filteredOrders = useMemo(() => {
    if (selectedBranch === 'all') return orders;
    return orders.filter(o => o.branchId === selectedBranch);
  }, [orders, selectedBranch]);

  const filteredTables = useMemo(() => {
    if (selectedBranch === 'all') return tables;
    return tables.filter(t => t.branchId === selectedBranch);
  }, [tables, selectedBranch]);

  const filteredStaff = useMemo(() => {
    if (selectedBranch === 'all') return staff;
    return staff.filter(s => !s.branchId || s.branchId === selectedBranch);
  }, [staff, selectedBranch]);

  // Calculate KPIs
  const todayRevenue = useMemo(() => {
    return filteredOrders
      .filter(o => o.status === 'completed' || o.status === 'served')
      .reduce((sum, o) => sum + o.total, 0);
  }, [filteredOrders]);

  const todayOrders = filteredOrders.length;
  
  const tableOccupancy = useMemo(() => {
    const occupied = filteredTables.filter(t => t.status === 'occupied').length;
    return filteredTables.length > 0 ? Math.round((occupied / filteredTables.length) * 100) : 0;
  }, [filteredTables]);

  const activeStaff = useMemo(() => {
    return filteredStaff.filter(s => s.status === 'active').length;
  }, [filteredStaff]);

  // Mock trends (in real app, calculate from historical data)
  const revenueTrend = 12;
  const ordersTrend = -5;
  const occupancyTrend = 8;
  const staffTrend = 0;

  // Top selling items with revenue
  const topSellingItems = useMemo(() => {
    const itemStats = filteredOrders.flatMap(o => o.items).reduce((acc, item) => {
      if (!acc[item.name]) {
        acc[item.name] = { name: item.name, quantity: 0, revenue: 0 };
      }
      acc[item.name].quantity += item.quantity;
      acc[item.name].revenue += item.price * item.quantity;
      return acc;
    }, {} as Record<string, { name: string; quantity: number; revenue: number }>);

    return Object.values(itemStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [filteredOrders]);

  // Order trends by time of day
  const ordersByTimeOfDay = useMemo(() => {
    const timeBuckets = {
      '6-9 AM': 0,
      '9-12 PM': 0,
      '12-3 PM': 0,
      '3-6 PM': 0,
      '6-9 PM': 0,
      '9-12 AM': 0,
    };

    filteredOrders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      if (hour >= 6 && hour < 9) timeBuckets['6-9 AM']++;
      else if (hour >= 9 && hour < 12) timeBuckets['9-12 PM']++;
      else if (hour >= 12 && hour < 15) timeBuckets['12-3 PM']++;
      else if (hour >= 15 && hour < 18) timeBuckets['3-6 PM']++;
      else if (hour >= 18 && hour < 21) timeBuckets['6-9 PM']++;
      else timeBuckets['9-12 AM']++;
    });

    return Object.entries(timeBuckets).map(([time, orders]) => ({ time, orders }));
  }, [filteredOrders]);

  // Filter orders for table
  const displayOrders = useMemo(() => {
    let filtered = filteredOrders;
    
    if (orderFilter !== 'all') {
      filtered = filtered.filter(o => o.status === orderFilter);
    }
    
    if (orderSearch) {
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.tableNumber.toString().includes(orderSearch)
      );
    }
    
    return filtered.slice(0, 10); // Show latest 10
  }, [filteredOrders, orderFilter, orderSearch]);

  // Staff performance
  const staffPerformance = useMemo(() => {
    return filteredStaff
      .filter(s => s.role === 'staff' || s.role === 'manager')
      .map(s => {
        const staffOrders = filteredOrders.filter(o => o.staffId === s.id);
        const totalSales = staffOrders.reduce((sum, o) => sum + o.total, 0);
        return {
          ...s,
          ordersServed: staffOrders.length,
          salesGenerated: totalSales,
          rating: 4.5 + Math.random() * 0.5, // Mock rating
        };
      })
      .sort((a, b) => b.salesGenerated - a.salesGenerated)
      .slice(0, 5);
  }, [filteredStaff, filteredOrders]);

  // Table status distribution
  const tableStatus = useMemo(() => {
    const available = filteredTables.filter(t => t.status === 'available').length;
    const occupied = filteredTables.filter(t => t.status === 'occupied').length;
    const reserved = filteredTables.filter(t => t.status === 'reserved').length;
    
    return [
      { name: 'Available', value: available, color: '#10b981' },
      { name: 'Occupied', value: occupied, color: '#ef4444' },
      { name: 'Reserved', value: reserved, color: '#3b82f6' },
    ];
  }, [filteredTables]);

  const CHART_COLORS = ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#eff6ff'];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', label: 'Pending' },
      'in-kitchen': { variant: 'default', label: 'In Kitchen' },
      ready: { variant: 'default', label: 'Ready' },
      served: { variant: 'default', label: 'Served' },
      completed: { variant: 'default', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1>Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, {user?.name}! Here's what's happening today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Today's Revenue"
          value={todayRevenue}
          suffix=" FCFA"
          icon={DollarSign}
          trend={revenueTrend}
          trendValue={`${revenueTrend}%`}
          color="green"
        />
        <KPICard
          title="Total Orders"
          value={todayOrders}
          icon={ShoppingCart}
          trend={ordersTrend}
          trendValue={`${ordersTrend}%`}
          color="blue"
        />
        <KPICard
          title="Table Occupancy"
          value={tableOccupancy}
          suffix="%"
          icon={UtensilsCrossed}
          trend={occupancyTrend}
          trendValue={`${occupancyTrend}%`}
          color="orange"
        />
        <KPICard
          title="Active Staff"
          value={activeStaff}
          icon={Users}
          trend={staffTrend}
          trendValue="No change"
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Graph */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sales Trend</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Revenue over time</p>
              </div>
              <div className="flex gap-2">
                {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                  <Button
                    key={period}
                    size="sm"
                    variant={chartPeriod === period ? 'default' : 'outline'}
                    onClick={() => setChartPeriod(period)}
                    className="capitalize"
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value: any) => [`${Number(value).toLocaleString()} FCFA`, 'Revenue']}
                  labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#1e3a8a" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Selling Dishes */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Dishes</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Best performers today</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSellingItems} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip 
                  formatter={(value: any) => [`${Number(value).toLocaleString()} FCFA`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#1e3a8a" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Trends by Time */}
        <Card>
          <CardHeader>
            <CardTitle>Order Trends by Time</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Peak hours analysis</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersByTimeOfDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Table Status */}
        <Card>
          <CardHeader>
            <CardTitle>Table Status</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Current table distribution</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tableStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tableStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl text-green-600">{tableStatus[0]?.value || 0}</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              <div>
                <div className="text-2xl text-red-600">{tableStatus[1]?.value || 0}</div>
                <div className="text-sm text-gray-600">Occupied</div>
              </div>
              <div>
                <div className="text-2xl text-blue-600">{tableStatus[2]?.value || 0}</div>
                <div className="text-sm text-gray-600">Reserved</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Overview */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Monitor live order flow</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="pl-10 w-[250px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={orderFilter} onValueChange={(v: any) => setOrderFilter(v)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.id}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>Table {order.tableNumber}</TableCell>
                        <TableCell>{order.total.toLocaleString()} FCFA</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="w-3 h-3" />
                            {new Date(order.createdAt).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Staff Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Performance</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Top performers today</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staffPerformance.map((member, index) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback className="bg-blue-600 text-white">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Award className="w-3 h-3 text-yellow-900" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>{member.name}</span>
                      <Badge variant="outline">{member.role}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {member.ordersServed} orders served • {member.salesGenerated.toLocaleString()} FCFA
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span>{member.rating.toFixed(1)} Rating</span>
                    </div>
                    <Progress value={(member.rating / 5) * 100} className="w-24 h-2 mt-1" />
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-200 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    #{index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Log (Optional) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <CardTitle>Recent Activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'New order received', detail: 'Table 5 - Order #1234', time: '2 min ago', color: 'blue' },
              { action: 'Payment completed', detail: 'Table 8 - 25,000 FCFA', time: '5 min ago', color: 'green' },
              { action: 'Reservation made', detail: 'Table 12 - 7:00 PM', time: '12 min ago', color: 'purple' },
              { action: 'Staff check-in', detail: 'John Doe started shift', time: '1 hour ago', color: 'gray' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0">
                <div className={`w-2 h-2 rounded-full bg-${activity.color}-600 mt-2`}></div>
                <div className="flex-1">
                  <div>{activity.action}</div>
                  <div className="text-sm text-gray-600">{activity.detail}</div>
                </div>
                <div className="text-sm text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
