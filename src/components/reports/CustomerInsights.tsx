import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import { Customer, Order } from '../../types';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner@2.0.3';

interface CustomerInsightsProps {
  customers: Customer[];
  orders: Order[];
  dateRange: { start: string; end: string };
}

export function CustomerInsights({ customers, orders, dateRange }: CustomerInsightsProps) {
  const segmentData = useMemo(() => {
    const segments = customers.reduce((acc, c) => {
      acc[c.segment] = (acc[c.segment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(segments).map(([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      value 
    }));
  }, [customers]);

  const topCustomers = useMemo(() => {
    return [...customers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
      .map(c => ({
        name: c.name,
        spent: c.totalSpent,
        orders: c.totalOrders,
      }));
  }, [customers]);

  const dailyOrders = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const count = orders.filter(o => o.createdAt.startsWith(date)).length;
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        orders: count,
      };
    });
  }, [orders]);

  const avgSpendData = useMemo(() => {
    return customers.map(c => ({
      name: c.name.split(' ')[0],
      avgSpend: c.totalOrders > 0 ? Math.round(c.totalSpent / c.totalOrders) : 0,
    })).sort((a, b) => b.avgSpend - a.avgSpend).slice(0, 10);
  }, [customers]);

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Customer Behavior Insights</h2>
          <p className="text-gray-500 mt-1">Understand customer habits and loyalty</p>
        </div>
        <Button onClick={() => toast.success('Exporting customer insights...')} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Customers</p>
            <div className="text-2xl mt-2">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">VIP Customers</p>
            <div className="text-2xl text-purple-600 mt-2">
              {customers.filter(c => c.segment === 'vip').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg Customer Spend</p>
            <div className="text-2xl mt-2">
              {customers.length > 0 
                ? Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length).toLocaleString()
                : 0} FCFA
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Segmentation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {segmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders Per Day (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyOrders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Customers by Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCustomers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                <Bar dataKey="spent" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Spend per Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={avgSpendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                <Bar dataKey="avgSpend" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Segment</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Orders</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Total Spend</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Loyalty Points</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {topCustomers.map((customer) => (
                  <tr key={customer.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{customer.name}</td>
                    <td className="px-4 py-3 text-sm capitalize">
                      {customers.find(c => c.name === customer.name)?.segment}
                    </td>
                    <td className="px-4 py-3 text-sm">{customer.orders}</td>
                    <td className="px-4 py-3 text-sm text-green-600">{customer.spent.toLocaleString()} FCFA</td>
                    <td className="px-4 py-3 text-sm">
                      {customers.find(c => c.name === customer.name)?.loyaltyPoints || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
