import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Download, Search } from 'lucide-react';
import { Order, MenuItem } from '../../types';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner@2.0.3';

interface SalesReportsProps {
  orders: Order[];
  menuItems: MenuItem[];
  dateRange: { start: string; end: string };
}

export function SalesReports({ orders, menuItems, dateRange }: SalesReportsProps) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter completed orders in date range
  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      (o.status === 'completed' || o.status === 'served') &&
      o.createdAt >= dateRange.start &&
      o.createdAt <= dateRange.end
    );
  }, [orders, dateRange]);

  // Daily sales trend
  const dailySales = useMemo(() => {
    const salesByDate: Record<string, { revenue: number; orders: number }> = {};
    
    filteredOrders.forEach(order => {
      const date = order.createdAt.split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = { revenue: 0, orders: 0 };
      }
      salesByDate[date].revenue += order.total;
      salesByDate[date].orders += 1;
    });

    return Object.entries(salesByDate)
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: data.revenue,
        orders: data.orders,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredOrders]);

  // Sales by category
  const salesByCategory = useMemo(() => {
    const categoryData: Record<string, number> = {};

    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const menuItem = menuItems.find(m => m.id === item.menuItemId);
        if (menuItem) {
          categoryData[menuItem.category] = (categoryData[menuItem.category] || 0) + (item.price * item.quantity);
        }
      });
    });

    return Object.entries(categoryData).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredOrders, menuItems]);

  // Top selling items
  const topSellingItems = useMemo(() => {
    const itemData: Record<string, { name: string; quantity: number; revenue: number; category: string }> = {};

    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const menuItem = menuItems.find(m => m.id === item.menuItemId);
        if (!itemData[item.menuItemId]) {
          itemData[item.menuItemId] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
            category: menuItem?.category || 'Other',
          };
        }
        itemData[item.menuItemId].quantity += item.quantity;
        itemData[item.menuItemId].revenue += item.price * item.quantity;
      });
    });

    let items = Object.values(itemData);

    // Apply category filter
    if (categoryFilter !== 'all') {
      items = items.filter(item => item.category === categoryFilter);
    }

    // Apply search filter
    if (searchQuery) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items.sort((a, b) => b.quantity - a.quantity);
  }, [filteredOrders, menuItems, categoryFilter, searchQuery]);

  // Sales by order type
  const salesByType = useMemo(() => {
    const typeData: Record<string, number> = {};

    filteredOrders.forEach(order => {
      typeData[order.type] = (typeData[order.type] || 0) + order.total;
    });

    return Object.entries(typeData).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' '),
      value,
    }));
  }, [filteredOrders]);

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const handleExport = () => {
    toast.success('Exporting sales report...');
  };

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(menuItems.map(item => item.category))];
  }, [menuItems]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl">Sales Reports</h2>
          <p className="text-gray-500 mt-1">Analyze revenue trends and top-selling items</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} name="Revenue (FCFA)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Distribution by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Count */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Order Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Order Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Items */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Top Selling Items</CardTitle>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Rank</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Quantity Sold</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {topSellingItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No items found
                    </td>
                  </tr>
                ) : (
                  topSellingItems.slice(0, 20).map((item, index) => (
                    <tr key={item.name} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                      <td className="px-4 py-3 text-sm">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-green-600">
                        {item.revenue.toLocaleString()} FCFA
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
