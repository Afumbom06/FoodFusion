import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, ShoppingCart } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface MenuAnalyticsProps {
  onBack: () => void;
}

export function MenuAnalytics({ onBack }: MenuAnalyticsProps) {
  const { menuItems, orders } = useApp();

  // Calculate analytics
  const analytics = useMemo(() => {
    // Top selling items
    const itemSales = menuItems.map(item => {
      const soldCount = orders.reduce((sum, order) => {
        const orderItem = order.items.find(i => i.name === item.name);
        return sum + (orderItem?.quantity || 0);
      }, 0);

      const revenue = orders.reduce((sum, order) => {
        const orderItem = order.items.find(i => i.name === item.name);
        return sum + (orderItem ? orderItem.quantity * orderItem.price : 0);
      }, 0);

      return { ...item, soldCount, revenue };
    }).sort((a, b) => b.revenue - a.revenue);

    const topSelling = itemSales.slice(0, 10);
    const leastSelling = itemSales.filter(i => i.soldCount > 0).slice(-5);

    // Category performance
    const categoryStats = new Map<string, { orders: number; revenue: number }>();
    menuItems.forEach(item => {
      if (!categoryStats.has(item.category)) {
        categoryStats.set(item.category, { orders: 0, revenue: 0 });
      }
      const stats = categoryStats.get(item.category)!;
      
      orders.forEach(order => {
        const orderItem = order.items.find(i => i.name === item.name);
        if (orderItem) {
          stats.orders += orderItem.quantity;
          stats.revenue += orderItem.quantity * orderItem.price;
        }
      });
    });

    const categoryPerformance = Array.from(categoryStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue);

    // Price distribution
    const priceRanges = [
      { range: '0-5K', count: menuItems.filter(i => i.price < 5000).length },
      { range: '5K-10K', count: menuItems.filter(i => i.price >= 5000 && i.price < 10000).length },
      { range: '10K-20K', count: menuItems.filter(i => i.price >= 10000 && i.price < 20000).length },
      { range: '20K+', count: menuItems.filter(i => i.price >= 20000).length },
    ];

    return {
      topSelling,
      leastSelling,
      categoryPerformance,
      priceRanges,
      totalRevenue: itemSales.reduce((sum, i) => sum + i.revenue, 0),
      totalOrders: itemSales.reduce((sum, i) => sum + i.soldCount, 0),
    };
  }, [menuItems, orders]);

  const COLORS = ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#eff6ff'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1>Menu Analytics</h1>
          <p className="text-gray-500 mt-1">Performance insights and trends</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <div className="text-2xl mt-1">
                  {(analytics.totalRevenue / 1000).toFixed(0)}K
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
                <p className="text-sm text-gray-600">Total Orders</p>
                <div className="text-2xl mt-1">{analytics.totalOrders}</div>
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
                <p className="text-sm text-gray-600">Avg. Item Price</p>
                <div className="text-2xl mt-1">
                  {Math.round(menuItems.reduce((sum, i) => sum + i.price, 0) / menuItems.length).toLocaleString()}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Items</p>
                <div className="text-2xl mt-1">
                  {menuItems.filter(i => i.available).length}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics.topSelling}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value: any) => value.toLocaleString()} />
                <Bar dataKey="revenue" fill="#1e3a8a" name="Revenue (FCFA)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={analytics.categoryPerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {analytics.categoryPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `${value.toLocaleString()} FCFA`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Best Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Units Sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Avg. Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.topSelling.slice(0, 10).map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-200 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      #{index + 1}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{item.soldCount}</TableCell>
                  <TableCell className="text-right text-green-600">
                    {item.revenue.toLocaleString()} FCFA
                  </TableCell>
                  <TableCell className="text-right">
                    {item.price.toLocaleString()} FCFA
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Least Selling Items */}
      {analytics.leastSelling.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Items Needing Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.leastSelling.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Only {item.soldCount} sold</div>
                    <div className="text-sm text-red-600">{item.revenue.toLocaleString()} FCFA</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
